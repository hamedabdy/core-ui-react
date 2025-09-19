import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import HelpIcon from "@mui/icons-material/Help";
import IconButton from "@mui/material/IconButton";
// import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

const lightColor = "rgba(255, 255, 255, 0.7)";

function Header(props) {
  const { onDrawerToggle, drawerWidth } = props;

  return (
    <AppBar
      color="primary"
      position="fixed"
      elevation={3}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        <Grid container spacing={1} alignItems="center">
          <Grid sx={{ display: { sm: "none", xs: "block" } }} item>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={onDrawerToggle}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
          </Grid>
          <Grid item xs />
          <Grid item xs>
            <Typography color="inherit" variant="h6" component="h1">
              Authentication
            </Typography>
          </Grid>
          <Tabs value={0} textColor="inherit">
            <Tab label="All" />
            <Tab label="Favorites" />
            <Tab label="History" />
            <Tab label="Workspace" />
            <Tab label="Admin" />
          </Tabs>

          <Grid item>
            <Button
              sx={{ borderColor: lightColor }}
              variant="outlined"
              color="inherit"
              size="small"
            >
              Web setup
            </Button>
          </Grid>
          <Grid item>
            <Tooltip title="Help">
              <IconButton color="inherit">
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Alerts • No alerts">
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <IconButton color="inherit" sx={{ p: 0.5 }}>
              <Avatar src="/static/images/avatar/1.jpg" alt="My Avatar" />
            </IconButton>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  onDrawerToggle: PropTypes.func.isRequired,
  drawerWidth: PropTypes.number.isRequired,
};

export default Header;
