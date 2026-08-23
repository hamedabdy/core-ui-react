import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ApiService from '../services/ApiService';
import './SidePanel.css';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/**
 * SidePanel Component (formerly Navigator)
 * 
 * Left sidebar that displays:
 * - Searchable menu of applications and modules
 * - Refresh button to reload data
 * - Pin button to toggle always-open state
 * 
 * Features:
 * - Fetches data from API (applications and modules)
 * - Search filters items case-insensitively by substring
 * - Responsive: overlays on mobile, adjacent on desktop
 * - Full keyboard navigation support
 * - Focus trapping when open
 * - WCAG AA accessible
 */

export default function SidePanel({
  isOpen = false,
  isPinned = false,
  onClose = () => {},
  onPinToggle = () => {},
  isMobile = false,
}) {
  const [searchValue, setSearchValue] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const panelRef = useRef(null);
  const searchInputRef = useRef(null);
  const firstMenuItemRef = useRef(null);

  // Load applications and modules from API
  const loadApplicationsAndModules = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: applications } = await ApiService.getData({
        table_name: 'sys_app_application',
      });

      const { data: modules } = await ApiService.getData({
        table_name: 'sys_app_module',
      });

      const appMap = new Map();
      applications.forEach((app) => {
        appMap.set(app.sys_id, {
          id: app.title || app.name,
          sys_id: app.sys_id,
          children: [],
        });
      });

      appMap.set('uncategorized', {
        id: 'Other Modules',
        sys_id: 'uncategorized',
        children: [],
      });

      modules.forEach((module) => {
        if (!module.active) return;

        const moduleData = {
          id: module.title || module.name,
          sys_id: module.sys_id,
          link:
            module.link_type === 'list_of_records'
              ? `./${module.name}.list`
              : module.link
              ? `/${module.link}`
              : '#',
        };

        const appId = module.sys_app_application || 'uncategorized';
        const category = appMap.get(appId);
        if (category) {
          category.children.push(moduleData);
        } else {
          appMap.get('uncategorized').children.push(moduleData);
        }
      });

      const categoriesData = Array.from(appMap.values()).filter(
        (category) => category.children.length > 0
      );

      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading navigation:', err);
      setError('Failed to load navigation menu');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadApplicationsAndModules();
  }, []);

  // Focus search on panel open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Focus trap for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Handle search input - filters items case-insensitively
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  // Handle refresh button
  const handleRefresh = () => {
    loadApplicationsAndModules();
  };

  // Handle menu item click - close panel on mobile
  const handleMenuItemClick = (link) => {
    if (link && link !== '#') {
      if (isMobile) {
        onClose();
      }
      window.location.href = link;
    }
  };

  // Filter categories and items based on search
  const filterCategories = () => {
    if (!searchValue.trim()) {
      return categories;
    }

    const searchLower = searchValue.toLowerCase();
    const filtered = categories
      .map((category) => ({
        ...category,
        children: category.children.filter((child) =>
          child.id.toLowerCase().includes(searchLower)
        ),
      }))
      .filter((category) => category.children.length > 0);

    return filtered;
  };

  const filteredCategories = filterCategories();
  const hasNoResults = searchValue.trim() && filteredCategories.length === 0;

  const react_id = React.useId();

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isMobile && isOpen && (
        <div
          className="sidepanel__backdrop"
          onClick={onClose}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Side Panel */}
      <aside
        ref={panelRef}
        className={`sidepanel ${isOpen ? 'sidepanel--open' : ''} ${
          isPinned ? 'sidepanel--pinned' : ''
        } ${isMobile ? 'sidepanel--mobile' : 'sidepanel--desktop'}`}
        aria-label="Navigation menu"
        role="navigation"
      >
        {/* Header with Search, Refresh, Pin */}
        <div className="sidepanel__header">
          <div className="sidepanel__search-box">
            <svg
              className="sidepanel__search-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="6" cy="6" r="4"></circle>
              <path d="M10 10l4 4"></path>
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="sidepanel__search-input"
              placeholder="Search..."
              value={searchValue}
              onChange={handleSearchChange}
              aria-label="Search navigation items"
            />
          </div>
        </div>

        {/* Menu Content */}
        <nav aria-label="Navigation items">
          {loading ? (
            <div className="sidepanel__loading">
              <span className="sidepanel__spinner"></span>
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div className="sidepanel__error">
              <p>{error}</p>
              <button
                className="sidepanel__retry-button"
                onClick={handleRefresh}
                type="button"
              >
                Retry
              </button>
            </div>
          ) : hasNoResults ? (
            <div className="sidepanel__no-results">
              <p>No results found for "{searchValue}"</p>
            </div>
          ) : (
            <List component="nav" aria-labelledby="sidepanel-menu">
              {filteredCategories.map((category) => (
                <Accordion key={category.sys_id}  defaultExpanded disableGutters 
                  sx={{
                    // Creates a glowing circle in the top-left corner fading out to transparent
                    background: 'linear-gradient(135deg, #1e1e24 50%, #0a0a0d 90%)',
                  // background: 'radial-gradient(circle at top left, #1e1e24 50%, #0a0a0d 70%)',
                  border: '1px solid rgba(200, 200, 220, 0.2)',
                  boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)', // White glow shadow
                  backdropFilter: 'blur(6px)',
                  }}>
                  <AccordionSummary
                    expandIcon={<ExpandLessIcon sx={{ color: 'white' }} />}
                    aria-controls={`${react_id}-panel1-content`}
                    id={`${react_id}-panel1-header`}
                    sx={{
                      pl: 1.1,
                      // Goal 1: Move icon to start (left) - Targeting the root class to beat MUI's default specificity
                      '& .MuiAccordionSummary-expandIconWrapper': {
                        order: -1, // <--- Forces the icon to render before the text
                        position: 'relative',
                      },
                      '&.Mui-expanded': {
                        minHeight: '44px', // Prevents height jump when expanded
                        height: '44px',
                      },
                      '& .MuiAccordionSummary-content': {
                        margin: 0, // <--- Removes default 12px top/bottom margin
                        '&.Mui-expanded': {
                          margin: 0, // Keeps margin removed when expanded
                        },
                      },
                    }}
                  >
                    <Typography 
                      sx={{
                        color: 'white',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)', // x, y, blur, color
                      }}
                    >
                    {category.id}</Typography>
                  </AccordionSummary>
                  {/* Goal 2: Vertical line extending down from the icon */}
                  <AccordionDetails 
                    sx={{ 
                      p: 0, 
                      // 20px aligns the border perfectly with the center of the 24px default MUI icon
                      ml: '20px', 
                      borderLeft: '1px solid rgba(255, 255, 255, 0.3)' 
                    }}
                  >
                    <List component="div" disablePadding>
                      {category.children.map((child, index) => (
                        <ListItem key={child.sys_id} disablePadding>
                          <ListItemButton
                            ref={index === 0 ? firstMenuItemRef : null}
                            component="a"
                            href={child.link}
                            onClick={(e) => {
                              if (isMobile && e.button === 0) {
                                e.preventDefault();
                                onClose();
                                window.location.href = child.link;
                              }
                            }}
                            role="menuitem"
                            sx={{
                              '&&': {
                                minHeight: '32px',
                                height: '32px',
                              },
                              justifyContent: 'flex-start', // <--- Forces flexbox to align left
                              textAlign: 'left',           // <--- Forces text to align left
                              p: 0,
                              pl: 2,
                            }}
                          >
                            <ListItemText primary={child.id}
                              sx={{ 
                                m: 0,
                                '& .MuiTypography-root': { 
                                  color: 'white', // Apply same text styling to children if desired
                                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                                  lineHeight: '1.2' 
                                }
                              }} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          )}
        </nav>
      </aside>
    </>
  );
}

SidePanel.propTypes = {
  isOpen: PropTypes.bool,
  isPinned: PropTypes.bool,
  onClose: PropTypes.func,
  onPinToggle: PropTypes.func,
  isMobile: PropTypes.bool,
};
