import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';


import ApiService from '../services/ApiService';
import './SidePanel.css';

// MUI Components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';

// MUI Icons
import CircularProgress from '@mui/material/CircularProgress';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

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
  onModuleClick = () => {},
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
    <React.Fragment>
      {/* Backdrop (click outside to close) */}
      {isOpen && !isPinned && (
        <Box
          className="sidepanel__backdrop"
          onClick={onClose}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Side Panel */}
      <Box
        component="aside"
        ref={panelRef}
        className={`sidepanel ${isOpen ? 'sidepanel--open' : ''} ${
          isPinned ? 'sidepanel--pinned' : ''
        } ${isMobile ? 'sidepanel--mobile' : 'sidepanel--desktop'}`}
        aria-label="Navigation menu"
        role="navigation"
      >
        {/* Header with Search */}
        <Box sx={{ pl: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap',}}>
          <InputBase
            inputRef={searchInputRef}
            className="sidepanel__search-input"
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearchChange}
            aria-label="Search navigation items"
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'white' }} />
              </InputAdornment>
            }
            sx={{
              flex: 1,
              color: 'white',
            }}
          />
          {/* Pin Button */}
          <IconButton 
            onClick={onPinToggle} 
            size="small" 
            aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            sx={{ 
              color: isPinned ? 'white' : 'rgba(255, 255, 255, 0.5)',
              // Optional: Add a slight background when pinned to show it's active
              backgroundColor: isPinned ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              }
            }}
          >
            {isPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
          </IconButton>
        </Box>

        {/* Menu Content */}
        <Box component="nav" aria-label="Navigation items">
          {loading ? (
            <Stack 
              className="sidepanel__loading" 
              alignItems="center" 
              justifyContent="center" 
              spacing={2} 
              sx={{ py: 4 }}
            >
              <CircularProgress size={24} sx={{ color: 'white' }} />
              <Typography variant="body2" sx={{ color: 'white' }}>
                Loading...
              </Typography>
            </Stack>
          ) : error ? (
            <Stack 
              className="sidepanel__error" 
              alignItems="center" 
              justifyContent="center" 
              spacing={2} 
              sx={{ py: 4, px: 2, textAlign: 'center' }}
            >
              <Typography color="error">{error}</Typography>
              <Button 
                variant="outlined" 
                color="error" 
                size="small" 
                onClick={handleRefresh}
              >
                Retry
              </Button>
            </Stack>
          ) : hasNoResults ? (
            <Box className="sidepanel__no-results" sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'white' }}>
                No results found for "{searchValue}"
              </Typography>
            </Box>
          ) : (
            <List component="nav" aria-labelledby="sidepanel-menu">
              {filteredCategories.map((category) => (
                <Accordion 
                  key={category.sys_id}  
                  defaultExpanded 
                  disableGutters 
                  sx={{
                    background: 'linear-gradient(135deg, #1e1e24 50%, #0a0a0d 90%)',
                    border: '1px solid rgba(200, 200, 220, 0.2)',
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandLessIcon sx={{ color: 'white' }} />}
                    aria-controls={`${react_id}-panel1-content`}
                    id={`${react_id}-panel1-header`}
                    sx={{
                      pl: 1.1,
                      '& .MuiAccordionSummary-expandIconWrapper': {
                        order: -1, 
                        position: 'relative',
                      },
                      '&.Mui-expanded': {
                        minHeight: '44px', 
                        height: '44px',
                      },
                      '& .MuiAccordionSummary-content': {
                        margin: 0, 
                        '&.Mui-expanded': {
                          margin: 0, 
                        },
                      },
                    }}
                  >
                    <Typography 
                      sx={{
                        color: 'white',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)', 
                      }}
                    >
                      {category.id}
                    </Typography>
                  </AccordionSummary>
                  
                  <AccordionDetails 
                    sx={{ 
                      p: 0, 
                      ml: '20px', 
                      borderLeft: '1px solid rgba(255, 255, 255, 0.3)' 
                    }}
                  >
                    <List component="div" disablePadding>
                      {category.children.map((child, index) => (
                        <ListItem key={child.sys_id} disablePadding>
                          <ListItemButton
                            ref={index === 0 ? firstMenuItemRef : null}
                            component={Link} 
                            to={child.link || '#'} 
                            onClick={(e) => {
                              // 3. If user is trying to open in a new tab (Ctrl/Cmd/Shift/Middle-click), 
                              // let the native browser handle it and DO NOT run our SPA logic.
                              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)
                                return;
                              
                              if (isMobile && e.button === 0) {
                                e.preventDefault();
                                onModuleClick(child); // Pass the whole child object {id, link} to parent
                              }
                            }}
                            role="menuitem"
                            sx={{
                              '&&': {
                                minHeight: '32px',
                                height: '32px',
                              },
                              justifyContent: 'flex-start', 
                              textAlign: 'left',           
                              p: 0,
                              pl: 2,
                            }}
                          >
                            <ListItemText 
                              primary={child.id}
                              sx={{ 
                                m: 0,
                                '& .MuiTypography-root': { 
                                  color: 'white', 
                                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                                  lineHeight: '1.2' 
                                }
                              }} 
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </React.Fragment>
  );
}

SidePanel.propTypes = {
  isOpen: PropTypes.bool,
  isPinned: PropTypes.bool,
  onClose: PropTypes.func,
  onPinToggle: PropTypes.func,
  isMobile: PropTypes.bool,
};