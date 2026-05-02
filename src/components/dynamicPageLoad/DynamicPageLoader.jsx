import React, { useState, useEffect } from 'react';
import ApiService from "../../services/ApiService";
import ErrorBoundary from './ErrorBoundary';

/**
 * Approved dependency registry.
 * Only modules listed here can be imported by DB scripts.
 */
const DEPENDENCY_REGISTRY = {
  'react': React,
  // Add other approved libraries here as needed:
  // 'axios': axios,
};

function resolveModule(moduleName) {
  if (DEPENDENCY_REGISTRY[moduleName]) return DEPENDENCY_REGISTRY[moduleName];
  throw new ReferenceError(
    `Module "${moduleName}" is not in the approved dependency registry. ` +
    `Add it to DEPENDENCY_REGISTRY in DynamicPageLoader.jsx.`
  );
}

function executeCompiledModule(compiledCode, pageName) {
  const module = { exports: {} };

  // Add a sourceURL so browser DevTools names this file correctly
  // instead of calling it "<anonymous code>"
  const codeWithPragma = `${compiledCode}\n//# sourceURL=DynamicPage_${pageName}.js`;
  
  const moduleFactory = new Function('require', 'module', 'exports', codeWithPragma);
  moduleFactory(resolveModule, module, module.exports);

  const Component = module.exports?.default ?? module.exports;

  if (typeof Component !== 'function') {
    throw new TypeError(
      `The database script must export a default React component. Got: ${typeof Component}`
    );
  }
  return Component;
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ height: '24px', width: '40%', background: '#e0e0e0', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '16px', width: '100%', background: '#e0e0e0', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '16px', width: '100%', background: '#e0e0e0', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '16px', width: '60%', background: '#e0e0e0', borderRadius: '4px' }} />
    </div>
  );
}

/**
 * Dynamically loads and renders a React component stored in sys_ui_page.
 * Uses tableApi.getData() to fetch the pre-compiled script from the database.
 *
 * @param {String} pageName - The value of the "name" field in sys_ui_page
 */
export default function DynamicPageLoader({ pageName }) {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Fetch the pre-compiled script using your tableApi.getData()
        const result = await ApiService.getData({
          table_name:      'sys_ui_page',
          sysparm_query:   `name=${pageName}`,
          sysparm_fields:  'name,jsx_compiled', // Only fetch what we need
        });
        
        const rows = result.data;

        // Validate the response
        if (rows.length === 0) {
          throw new Error(`Page "${pageName}" was not found in sys_ui_page.`);
        }

        const record = rows.pop(); // Get the first (and should be only) record

        if (!record.jsx_compiled) {
          throw new Error(
            `Page "${pageName}" exists but has no compiled script. ` +
            `Re-save the record to trigger compilation.`
          );
        }

        // Execute the compiled module and extract the React component
        const DynamicComponent = executeCompiledModule(record.jsx_compiled, pageName);

        if (!cancelled) setComponent(() => DynamicComponent);

      } catch (err) {
        console.error(`[DynamicPageLoader] Failed to load "${pageName}":`, err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (pageName) {
      load();
    } else {
      setError('No pageName prop was provided to DynamicPageLoader.');
      setLoading(false);
    }

    // Cleanup: prevent state updates if component unmounts mid-fetch
    return () => { cancelled = true; };

  }, [pageName]); // Re-runs automatically if pageName changes

  if (loading)    return <LoadingSkeleton />;
  if (error)      return (
    <div role="alert" style={{
      padding: '20px', color: '#c0392b',
      border: '1px solid #e74c3c', borderRadius: '6px', margin: '16px'
    }}>
      <strong>Failed to load: {pageName}</strong>
      <pre style={{ marginTop: '8px', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
        {error}
      </pre>
    </div>
  );
  if (!Component) return null;

  return (
    <ErrorBoundary pageName={pageName}>
      <Component />
    </ErrorBoundary>
  );
}