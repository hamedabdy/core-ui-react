import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import TableList from "./TableList";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Menu,
  // Typography,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";

const Home = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const navigate = useNavigate();

  const handleTableSelect = (url) => {
    navigate(url);
  };

  const handleAllClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <Box
      component="main"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden", // Prevent content overflow
      }}
    >
      {/* Top Navigation Bar */}
      <AppBar component="header" position="static" style={{ width: "100%" }}>
        {" "}
        {/* Ensure AppBar spans the full width */}
        <Toolbar
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/path/to/logo.png"
              alt="Company Logo"
              style={{ height: "40px", marginRight: "16px" }}
            />
            <IconButton
              color="inherit"
              onClick={handleAllClick}
              aria-label="Open table list menu"
            >
              All
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <TableList onTableSelect={handleTableSelect} />
            </Menu>
          </Box>
          <Box>
            <IconButton color="inherit" aria-label="User account">
              <AccountCircleIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="Settings">
              <SettingsIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box
        component="section"
        style={{
          flex: 1,
          border: "1px solid #ccc",
          width: "100%",
          overflow: "auto",
        }}
      >
        {/* Allow scrolling for overflowing content */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Home;
