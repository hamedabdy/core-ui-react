import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Local Components
import TopNav from './TopNav';
import SidePanel from './SidePanel';
import Content from './Content';
// Styles
import './Layout.css';
import './tokens.css';

// MUI Components
import { Box, Link } from '@mui/material';

/**
 * Main Layout Component (formerly Paperbase)
 * 
 * Integrates:
 * - TopNav (sticky header with menu and user options)
 * - SidePanel (responsive sidebar with searchable navigation)
 * - Content (main content area with Outlet)
 * 
 * Features:
 * - Responsive design (mobile/desktop)
 * - Light/dark mode toggle with localStorage persistence
 * - Focus management for accessibility
 * - Proper z-index stacking
 */

export default function Paperbase() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 640;
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPanelPinned, setIsPanelPinned] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('theme-preference');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [pageTitle, setPageTitle] = useState('Home');

  // Handle responsive design changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 640;
      setIsMobile(mobile);

      // Automatically close panel on mobile (unless pinned)
      if (mobile && isPanelOpen && !isPanelPinned) {
        setIsPanelOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPanelOpen, isPanelPinned]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.colorScheme = 'dark';
    } else {
      root.style.colorScheme = 'light';
    }

    // Persist theme preference
    localStorage.setItem('theme-preference', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Handle drawer/panel toggle
  const handleDrawerToggle = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  // Handle panel close (when clicking outside on mobile)
  const handlePanelClose = () => {
    if (!isPanelPinned) {
      setIsPanelOpen(false);
    }
  };

  // Handle pin toggle
  const handlePinToggle = () => {
    setIsPanelPinned(!isPanelPinned);
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle panel "All" menu click
  const handleMenuClick = (menuName) => {
    if (menuName === 'All') {
      // Toggles the panel open/closed when "All" is clicked
      setIsPanelOpen((prev) => !prev); 
    }
    // setPageTitle(menuName);
  };

  // NEW: Handle SidePanel module clicks (e.g., "User Preference")
  const handleModuleNavigation = (module) => {
    setPageTitle(module.id); // Sets title to "User Preference"
    
    if (isMobile) {
      handlePanelClose();
    }
    
    // FIX: Use React Router navigate instead of window.location.href
    // This swaps only the <Outlet /> without reloading the page!
    navigate(module.link);
  };

    return (
    <Box className={`layout ${isDarkMode ? 'layout--dark' : 'layout--light'}`}>
      {/* Top Navigation */}
      <TopNav
        onDrawerToggle={handleDrawerToggle}
        onMenuClick={handleMenuClick} // <--- Fixed: Was handleDrawerToggle
        pageTitle={pageTitle}
        isMobile={isMobile}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />

      {/* Main Container */}
      <Box className="layout__container">
        {/* Side Panel */}
        <SidePanel
          isOpen={isPanelOpen}
          isPinned={isPanelPinned}
          onClose={handlePanelClose}
          onPinToggle={handlePinToggle}
          isMobile={isMobile}
          onModuleClick={handleModuleNavigation}
        />

        {/* Main Content Area */}
        <Box 
          component="main" 
          className="layout__main" 
          id="main-content" 
          sx={{
            // Shift content right ONLY when open AND pinned AND on desktop
            marginLeft: isPanelOpen && isPanelPinned && !isMobile ? 'var(--drawer-width)' : '0',
            // Smooth animation when it shifts
            transition: 'margin 0.3s ease-in-out' 
          }}
        >
          {/* Pass setPageTitle down to Content so it can append record values later */}
          <Content onMenuClick={handleMenuClick} setPageTitle={setPageTitle} />
        </Box>
      </Box>

      {/* Skip to main content link (for accessibility) */}
      <Link 
        href="#main-content" 
        className="skip-to-main"
        underline="none"
        sx={{
          position: 'absolute',
          left: '-9999px',
          '&:focus': {
            left: '16px',
            top: '16px',
            zIndex: 9999,
            backgroundColor: 'background.paper',
            padding: '8px 16px',
            borderRadius: '4px',
            boxShadow: 1
          }
        }}
      >
        Skip to main content
      </Link>
    </Box>
  );
}
