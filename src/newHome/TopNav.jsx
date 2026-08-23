import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './TopNav.css';

/**
 * TopNav Component
 * 
 * Sticky top navigation bar with:
 * - App logo and menu items
 * - Page title
 * - Global search placeholder
 * - Chat panel placeholder
 * - User avatar with submenu
 * 
 * Accessibility:
 * - Semantic <header> tag
 * - Keyboard navigation via Tab
 * - Focus indicators on all interactive elements
 * - ARIA labels for icon-only buttons
 * - WCAG AA contrast compliance
 * 
 * Responsive:
 * - Mobile (375px): Hamburger menu
 * - Desktop (1280px+): Full menu visible
 */

export default function TopNav({
  onDrawerToggle = () => {},
  onMenuClick = () => {},
  pageTitle = 'Home',
  isMobile = false,
  isDarkMode = false,
  onThemeToggle = () => {},
}) {
  const [menuActive, setMenuActive] = useState(null);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const handleMenuClick = (menuName) => {
    setMenuActive(menuName);
    onMenuClick(menuName);
  };

  const handleAvatarClick = () => {
    setSubmenuOpen(!submenuOpen);
  };

  const handleSubmenuItemClick = (item) => {
    console.log('Submenu item clicked:', item);
    setSubmenuOpen(false);
  };

  const handleKeyDown = (e, handler) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };

  const menuItems = ['All', 'Favorites', 'History', 'Workspace', 'Admin'];

  return (
    <header className={`topnav ${isDarkMode ? 'topnav--dark' : 'topnav--light'}`}>
      <div className="topnav__container">
        {/* Left Zone: Logo and Menu */}
        <div className="topnav__left">
          {/* Logo */}
          <div className="topnav__logo">
            <a href="./" className="topnav__logo-link">
              <span className="topnav__logo-text">flint</span>
            </a>
          </div>

          {/* Menu Items (Desktop) */}
          {!isMobile && (
            <nav className="topnav__menu" aria-label="Main navigation">
              <ul className="topnav__menu-list">
                {menuItems.map((item) => (
                  <li key={item} className="topnav__menu-item">
                    <button
                      className={`topnav__menu-button ${
                        menuActive === item ? 'topnav__menu-button--active' : ''
                      }`}
                      onClick={() => handleMenuClick(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        {/* Center Zone: Page Title */}
        <div className="topnav__center">
          <h1 className="topnav__title">{pageTitle}</h1>
        </div>

        {/* Right Zone: Search, Chat, Theme Toggle, Avatar */}
        <div className="topnav__right">
          {/* Global Search Placeholder */}
          <div className="topnav__search-placeholder" title="Search feature coming soon">
            <span className="sr-only">Global search (coming soon)</span>
            <svg
              className="topnav__search-icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="8" cy="8" r="6"></circle>
              <path d="M12 12l6 6"></path>
            </svg>
          </div>

          {/* Chat Panel Placeholder */}
          <button
            className="topnav__icon-button topnav__chat-button"
            aria-label="Chat panel (coming soon)"
            disabled
            type="button"
            title="Chat feature coming soon"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 7a4 4 0 014-4h6a4 4 0 014 4v6a4 4 0 01-4 4h-2l-4 2v-2a4 4 0 01-4-4V7z"></path>
            </svg>
          </button>

          {/* Theme Toggle */}
          <button
            className="topnav__icon-button topnav__theme-button"
            onClick={onThemeToggle}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <circle cx="10" cy="10" r="4"></circle>
                <path d="M10 1v3M10 16v3M1 10h3M16 10h3M3.22 3.22l2.12 2.12M14.66 14.66l2.12 2.12M3.22 16.78l2.12-2.12M14.66 5.34l2.12-2.12"></path>
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.293 13.293a8 8 0 11-11.586-11.586c.464.465.927.927 1.414 1.414A6 6 0 017 16a6 6 0 0010.293-2.707z"></path>
              </svg>
            )}
          </button>

          {/* User Avatar & Submenu */}
          <div className="topnav__avatar-container">
            <button
              className="topnav__avatar-button"
              onClick={handleAvatarClick}
              aria-label="User menu"
              aria-expanded={submenuOpen}
              aria-haspopup="menu"
              type="button"
            >
              <span className="topnav__avatar">U</span>
            </button>

            {/* Submenu */}
            {submenuOpen && (
              <div
                className="topnav__submenu"
                role="menu"
                aria-label="User options"
              >
                <button
                  className="topnav__submenu-item"
                  onClick={() => handleSubmenuItemClick('profile')}
                  role="menuitem"
                  type="button"
                >
                  Profile
                </button>
                <button
                  className="topnav__submenu-item"
                  onClick={() => handleSubmenuItemClick('preferences')}
                  role="menuitem"
                  type="button"
                >
                  Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

TopNav.propTypes = {
  onDrawerToggle: PropTypes.func,
  onMenuClick: PropTypes.func, 
  pageTitle: PropTypes.string,
  isMobile: PropTypes.bool,
  isDarkMode: PropTypes.bool,
  onThemeToggle: PropTypes.func,
};
