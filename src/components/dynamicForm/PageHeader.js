import { Link as ReactRouterLink } from "react-router-dom";
import { styled } from "@mui/system";
import {
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Box
} from "@mui/material";

import ArrowLeftIcon from '@mui/icons-material/ArrowBackIosNew';
import MenuIcon from '@mui/icons-material/Menu';

// IMPORT LOCAL COMPONENTS
import FormButtons from "./FormButtons";

const StyledAppBar = styled(AppBar)({
  marginBottom: "1em",
});

const PageHeader = (props) => {
  const { table, sysID, formData, insertAndStay, handleDelete } = props;

  return (
    <Paper elevation={1}>
      <StyledAppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box>
            <Tooltip aria-label="Go back">
              <IconButton
                component={ReactRouterLink}
                to={`../${table.name}.list`}
                sx={{
                  backgroundColor: "#E9E9E9", // light grey
                  borderRadius: 0.5, // squared corners (4px)
                  "&:hover": {
                    backgroundColor: "#e0e0e0", // slightly darker on hover
                  },
                  boxShadow: "none",
                  padding: 1,
                }}
              >
                <ArrowLeftIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
            <Tooltip aria-label="Menu">
              <IconButton
                component={ReactRouterLink}
                to={"#"}
                sx={{
                  marginLeft: 1,
                  backgroundColor: "#E9E9E9", // light grey
                  borderRadius: 0.5, // squared corners (4px)
                  "&:hover": {
                    backgroundColor: "#e0e0e0", // slightly darker on hover
                  },
                  boxShadow: "none",
                  padding: 1,
                }}
              >
                <MenuIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ flexGrow: 1, ml: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 0, lineHeight: 1.1 }}
            >
              {table.label}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 0, lineHeight: 1.2 }}>
              {(!sysID || sysID === "-1" || sysID === "")
                ? "New record"
                : (formData && formData.sys_name ? formData.sys_name : "")}
            </Typography>
          </Box>
          <FormButtons
            insertAndStay={insertAndStay}
            handleDelete={handleDelete}
          />
        </Toolbar>
      </StyledAppBar>
      <Paper elevation={1} sx={{ borderRadius: 0, pl: 1 }}>
        Related records {/* TODO */}
      </Paper>
    </Paper>
  );
};

export default PageHeader;
