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
import HeaderMenu from "../shared/HeaderMenu";


const StyledAppBar = styled(AppBar)({
  marginBottom: "1em",
});

const PageHeader = (props) => {
  const { table, sysID, formData, insertAndStay, handleDelete, onFormLayoutClick } = props;
  const safeTableName = table?.name || "";
  const safeTableLabel = table?.label || "Loading...";

  return (
    <Paper elevation={1}>
      <StyledAppBar position="static" color="default" elevation={1} sx={{ m: 0 }}>
        <Toolbar>
          <Box>
            <Tooltip aria-label="Go back">
              <IconButton
                component={ReactRouterLink}
                to={safeTableName ? `../${safeTableName}.list` : ".."}
                sx={{
                  mr: 1,
                  backgroundColor: "#E9E9E9", // light grey
                  borderRadius: 0.5, // squared corners (4px)
                  "&:hover": {
                    backgroundColor: "#e0e0e0", // slightly darker on hover
                  },
                  boxShadow: "none",
                  minWidth: 32,
                  minHeight: 32,
                }}
              >
                <ArrowLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {safeTableName && (
              <HeaderMenu tableName={safeTableName} onFormLayoutClick={onFormLayoutClick} />
            )}
          </Box>
          <Box sx={{ flexGrow: 1, ml: 1 }}>
            <Typography
              variant="h7"
              sx={{ fontWeight: "bold", mb: 0, lineHeight: 1 }}
            >
              {safeTableLabel}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 0, lineHeight: 1 }}>
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
      <Paper elevation={0} sx={{ borderRadius: 0, p: 1 }}>
        Related records {/* TODO */}
      </Paper>
    </Paper>
  );
};

export default PageHeader;
