import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/**
 * HeaderMenu – a reusable menu component used in the DynamicList toolbar.
 *
 * When the icon button is clicked a menu appears with the following hierarchy:
 *   Configure ▶ Table – redirects to the table definition page
 *   Configure ▶ Dictionary – redirects to the dictionary definition page
 *   Import XML – redirects to the import XML page
 *
 * The component receives the current `tableName` as a prop and builds the URLs
 * dynamically.
 */
const HeaderMenu = ({ tableName, onFormLayoutClick }) => {
  const safeTableName = tableName || "";
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    handleConfigClose();
  };

  // Sub‑menu for "Configure"
  const [configAnchorEl, setConfigAnchorEl] = useState(null);
  const configOpen = Boolean(configAnchorEl);
  const handleConfigOpen = (event) => {
    // Prevent the main menu from closing when opening the sub‑menu
    event.stopPropagation();
    setConfigAnchorEl(event.currentTarget);
  };
  const handleConfigClose = () => {
    setConfigAnchorEl(null);
  };

  const navigate = (url) => {
    window.location.href = url;
    handleClose();
  };

  return (
    <>
      <Tooltip aria-label="Menu">
        <IconButton
          onClick={handleOpen}
          sx={{
            backgroundColor: "#E9E9E9",
            borderRadius: 0.5,
            "&:hover": { backgroundColor: "#e0e0e0" },
            boxShadow: "none",
            minWidth: 32,
            minHeight: 32,
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        // Ensure items are stacked vertically
        MenuListProps={{
          "aria-labelledby": "table-menu-button",
          dense: true,
          sx: { display: "flex", flexDirection: "column" },
        }}
        // Remove default elevation/shadow
        PaperProps={{ elevation: 1, sx: { boxShadow: "none" } }}
      >
        {/* Configure submenu trigger */}
        <MenuItem onClick={handleConfigOpen}>
          <ListItemText primary="Configure" />
          <ListItemIcon>
            <ChevronRightIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
        {/* Import XML */}
        <MenuItem onClick={() => navigate("./page/$importxml")}>
            Import XML
        </MenuItem>
      </Menu>
      {/* Nested Configure menu */}
      <Menu
        anchorEl={configAnchorEl}
        open={configOpen}
        onClose={handleConfigClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        // Ensure submenu items are stacked vertically
        MenuListProps={{
          "aria-labelledby": "configure-submenu",
          dense: true,
          sx: { display: "flex", flexDirection: "column" },
        }}
      >
        <MenuItem
          onClick={() =>
            safeTableName && navigate(`./sys_db_object.list?sysparm_query=name=${safeTableName}`)
          }
        >
          Table
        </MenuItem>
        <MenuItem
          onClick={() =>
            safeTableName && navigate(`./sys_dictionary.list?sysparm_query=name=${safeTableName}`)
          }
        >
          Dictionary
        </MenuItem>
        <MenuItem
          onClick={() =>
            safeTableName && navigate(`./sys_script.list?sysparm_query=collection=${safeTableName}`)
          }
        >
          Business Rules
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            onFormLayoutClick();
          }}
        >
          Form Layout
        </MenuItem>
      </Menu>
    </>
  );
};

HeaderMenu.propTypes = {
  /** Name of the current table – used to build the redirect URLs */
  tableName: PropTypes.string,
};

export default HeaderMenu;
