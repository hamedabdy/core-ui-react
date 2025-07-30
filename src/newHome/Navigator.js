import * as React from "react";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import PermMediaOutlinedIcon from "@mui/icons-material/PhotoSizeSelectActual";
import PublicIcon from "@mui/icons-material/Public";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import TimerIcon from "@mui/icons-material/Timer";
import SettingsIcon from "@mui/icons-material/Settings";
import PhonelinkSetupIcon from "@mui/icons-material/PhonelinkSetup";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import PushPinIcon from "@mui/icons-material/PushPin";

const categories = [
  {
    id: "Build",
    children: [
      {
        id: "Authentication",
        icon: <PeopleIcon />,
        active: true,
      },
      { id: "Database", icon: <DnsRoundedIcon /> },
      { id: "Storage", icon: <PermMediaOutlinedIcon /> },
      { id: "Hosting", icon: <PublicIcon /> },
      { id: "Functions", icon: <SettingsEthernetIcon /> },
      {
        id: "Machine learning",
        icon: <SettingsInputComponentIcon />,
      },
    ],
  },
  {
    id: "Quality",
    children: [
      { id: "Analytics", icon: <SettingsIcon /> },
      { id: "Performance", icon: <TimerIcon /> },
      { id: "Test Lab", icon: <PhonelinkSetupIcon /> },
    ],
  },
];

const item = {
  py: "2px",
  px: 3,
  color: "rgba(255, 255, 255, 0.7)",
  "&:hover, &:focus": {
    bgcolor: "rgba(255, 255, 255, 0.08)",
  },
};

const itemCategory = {
  boxShadow: "0 -1px 0 rgb(255,255,255,0.1) inset",
  py: 1.5,
  px: 3,
};

export default function Navigator(props) {
  const { pinned = false, onPinToggle, onRefresh, onSearch, ...other } = props;
  const [searchValue, setSearchValue] = React.useState("");

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
              onClick={onRefresh}
              size="small"
              sx={{ color: "#fff", ml: 0.5 }}
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
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText>Project Overview</ListItemText>
        </ListItem>
        {categories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: "#101F33" }}>
            <ListItem sx={{ py: 2, px: 3 }}>
              <ListItemText sx={{ color: "#fff" }}>{id}</ListItemText>
            </ListItem>
            {children.map(({ id: childId, icon, active }) => (
              <ListItem disablePadding key={childId}>
                <ListItemButton selected={active} sx={item}>
                  <ListItemIcon>{icon}</ListItemIcon>
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
