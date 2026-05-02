import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error(`[ErrorBoundary] Runtime error in "${this.props.pageName}":`, error, info);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ padding: '24px', border: '1px solid #e74c3c', borderRadius: '8px' }}>
          <h3 style={{ color: '#c0392b' }}>Runtime error in "{this.props.pageName}"</h3>
          <pre style={{ fontSize: '12px', marginTop: '8px', whiteSpace: 'pre-wrap', color: '#7f8c8d' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={this.handleReset} style={{ marginTop: '12px', padding: '6px 14px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}