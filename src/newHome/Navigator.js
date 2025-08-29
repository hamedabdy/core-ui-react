import React from "react";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import PushPinIcon from "@mui/icons-material/PushPin";
import ApiService from "../services/ApiService";

const item = {
  py: 0,
  px: 2,
  color: "rgba(255, 255, 255, 0.7)",
  "&:hover, &:focus": {
    bgcolor: "rgba(255, 255, 255, 0.08)",
  },
};

const itemCategory = {
  boxShadow: "0 -1px 0 rgb(255,255,255,0.1) inset",
  py: 0.5,
  px: 1,
};

export default function Navigator(props) {
  const { pinned = false, onPinToggle, onRefresh, onSearch, ...other } = props;
  const [searchValue, setSearchValue] = React.useState("");
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadApplicationsAndModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all applications
      const { data: applications } = await ApiService.getData({ 
        table_name: 'sys_app_application'
      });
      
      // Get all modules
      const { data: modules } = await ApiService.getData({ 
        table_name: 'sys_app_module'
      });

      // Create a map of applications
      const appMap = new Map();
      applications.forEach(app => {
        appMap.set(app.sys_id, {
          id: app.title || app.name,
          sys_id: app.sys_id,
          children: []
        });
      });

      // Add a category for modules without application
      appMap.set('uncategorized', {
        id: 'Other Modules',
        sys_id: 'uncategorized',
        children: []
      });

      // Process only active modules
      modules.forEach(module => {
        // Skip inactive modules
        if (!module.active) return;

        const moduleData = {
          id: module.title || module.name,
          sys_id: module.sys_id,
          link: module.link_type === 'list_of_records' ? 
                `./${module.name}.list` : 
                (module.link ? `/${module.link}` : '#')
        };

        // Add module to its application category or to uncategorized
        const appId = module.sys_app_application || 'uncategorized';
        const category = appMap.get(appId);
        if (category) {
          category.children.push(moduleData);
        } else {
          appMap.get('uncategorized').children.push(moduleData);
        }
      });

      // Convert map to array and filter out empty categories
      const categoriesData = Array.from(appMap.values())
        .filter(category => category.children.length > 0);

      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading navigation:', err);
      setError('Failed to load navigation menu');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  React.useEffect(() => {
    loadApplicationsAndModules();
  }, []);

  // Refresh handler now reloads the data
  const handleRefresh = () => {
    loadApplicationsAndModules();
    if (onRefresh) onRefresh();
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem
          sx={{
            ...item,
            ...itemCategory,
            fontSize: 18,
            fontWeight: 600,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 1,
            py: 1,
            px: 2,
          }}
          disableGutters
          secondaryAction={null}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              bgcolor: "#22304a",
              borderRadius: 1,
              px: 1,
              py: 0.5,
            }}
          >
            <SearchIcon sx={{ color: "#fff", mr: 1 }} />
            <InputBase
              placeholder="Search..."
              value={searchValue}
              onChange={handleSearchChange}
              sx={{
                color: "#fff",
                flex: 1,
                fontSize: 16,
                input: { p: 0 },
              }}
              inputProps={{ "aria-label": "search navigator" }}
            />
            <IconButton
              aria-label="refresh"
              onClick={handleRefresh}
              size="small"
              sx={{ color: "#fff", ml: 0.5 }}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              aria-label="pin sidebar"
              onClick={onPinToggle}
              size="small"
              sx={{ color: pinned ? "#ffd600" : "#fff", ml: 0.5 }}
            >
              <PushPinIcon />
            </IconButton>
          </Box>
        </ListItem>
        <ListItem sx={{ ...item, ...itemCategory }}>
        </ListItem>
        {loading ? (
          <ListItem sx={{ ...item, ...itemCategory }}>
            <ListItemText>Loading...</ListItemText>
          </ListItem>
        ) : error ? (
          <ListItem sx={{ ...item, ...itemCategory }}>
            <ListItemText sx={{ color: 'error.main' }}>{error}</ListItemText>
          </ListItem>
        ) : categories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: "#101F33" }}>
            <ListItem sx={{ py: 0, px: 1 }}>
              <ListItemText sx={{ color: "#fff" }}>{id}</ListItemText>
            </ListItem>
            {children.map(({ id: childId, active, link }) => (
              <ListItem disablePadding key={childId}>
                <ListItemButton
                  selected={active}
                  sx={item}
                  component="a"
                  href={link}
                  onClick={(e) => {
                    e.preventDefault();
                    if (link && link !== '#') {
                      window.location.href = link;
                    }
                  }}
                >
                  <ListItemText>{childId}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
