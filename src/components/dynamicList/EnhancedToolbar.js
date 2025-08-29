import PropTypes from "prop-types"; // data type checking
import { useState } from "react";
import { Link as ReactRouterLink } from "react-router-dom";

import ToolbarActions from "./ToolbarActions";
import ListSettings from "./ListSettings";

// Styles
import { alpha } from "@mui/material/styles";
import ArrowLeftIcon from '@mui/icons-material/ArrowBackIosNew';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';

import {
  AppBar,
  Button,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";

const EnhancedToolbar = (props) => {
  const { numSelected, tableName, table, columns, onFilterChange } = props;
  const [toolbarSearchValue, settoolbarSearchValue] = useState("");
  const [toolbarSearchField, setToolbarSearchField] = useState(columns && columns.length > 0 ? columns[0].element : "name");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(
    columns ? columns.map(col => col.element) : (table?.visibleColumns || [])
  );

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleDialogOk = (newColumns) => {
    setSelectedColumns(newColumns);
    if (props.onColumnsChange) props.onColumnsChange(newColumns);
    setDialogOpen(false);
  };

  const handleToolbarSearchFieldChange = (event) => {
    setToolbarSearchField(event.target.value);
  };

  const handleToolbarSearchValueChange = (event) => {
    settoolbarSearchValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      if (onFilterChange) {
        if (toolbarSearchField && toolbarSearchValue.trim()) {
          const query = `${toolbarSearchField}STARTSWITH${toolbarSearchValue.trim()}`;
          onFilterChange(query);
        } else {
          onFilterChange('');
        }
      }
    }
  };

  return (
    <AppBar
      elevation={1}
      color="default"
      sx={{ position: "relative", zIndex: 100, padding: 1, backgroundColor: "#ddddddc7" }}
    >
      <Toolbar
        sx={{
          pl: { sm: 1 },
          pr: { sm: 1 },
          ...(numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.activatedOpacity
              ),
          }),
        }}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <>
            <Tooltip aria-label="Go back">
              <IconButton
                component={ReactRouterLink}
                to={"../"}
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
            <Typography
              sx={{
                flex: "1 1 35%",
                fontWeight: "bold",
                textTransform: "capitalize",
                marginLeft: 1
              }}
              variant="h7"
              id="tableTitle"
              component="div"
              aria-label={tableName}
            >
              {table.label}
            </Typography>
            <ToolbarSearch
              toolbarSearchField={toolbarSearchField}
              handleToolbarSearchFieldChange={handleToolbarSearchFieldChange}
              columns={columns}
              toolbarSearchValue={toolbarSearchValue}
              handleToolbarSearchValueChange={handleToolbarSearchValueChange}
              handleKeyPress={handleKeyPress}
            />
          </>
        )}
        <Tooltip aria-label="Settings">
          <IconButton
            onClick={handleOpenDialog}
            sx={{
              backgroundColor: "#E9E9E9",
              borderRadius: 0.5,
              ml: 1,
              "&:hover": { backgroundColor: "#e0e0e0" },
              boxShadow: "none",
              padding: 1,
              marginRight: 1,
            }}
          >
            <SettingsIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
        {/* Actions moved to ToolbarActions */}
        <ToolbarActions tableName={tableName} numSelected={numSelected} />
        <Button variant="contained" href={`./${tableName}.form?sys_id=-1`}>
        New
      </Button>
        <ListSettings
          open={dialogOpen}
          onClose={handleCloseDialog}
          onOk={handleDialogOk}
          columns={columns}
          selectedColumns={selectedColumns}
        />
      </Toolbar>
    </AppBar>
  );
};

EnhancedToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  tableName: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  table: PropTypes.object,
  onFilterChange: PropTypes.func,
  onColumnsChange: PropTypes.func,
};

const ToolbarSearch = ({
  toolbarSearchField,
  handleToolbarSearchFieldChange,
  columns,
  toolbarSearchValue,
  handleToolbarSearchValueChange,
  handleKeyPress,
}) => {
  return (
    <Box sx={{ marginLeft: 1, width: "100%" }}>
      <Box>
        <Select
          labelId="toolbar-search-select-label"
          id="toolbar-search-select-autowidth"
          value={toolbarSearchField}
          onChange={handleToolbarSearchFieldChange}
          name="toolbar-search-select"
          sx={{
            width: "9dvw",
            height: 32, // Shorter height
            borderRadius: 0.5,
            "& .MuiSelect-select": {
              py: "4px", // Reduce paddingc',
              height: "1.4375em",
              minHeight: "auto",
            },
          }}
        >
          {columns.map((column) => (
            <MenuItem key={column.element} value={column.element}>
              {column.column_label}
            </MenuItem>
          ))}
        </Select>
        <TextField
          placeholder="Search"
          sx={{
            minWidth: "10dvw",
            maxWidth: "12dvw",
            "& .MuiInputBase-root": {
              height: 32, // Shorter height
              "& input": {
                py: "4px", // Reduce padding
                height: "auto",
              },
              "& fieldset": {
                borderRadius: 0.5,
              },
            },
          }}
          id="toolbar-search-input"
          value={toolbarSearchValue}
          onChange={handleToolbarSearchValueChange}
          onKeyPress={handleKeyPress}
          autoComplete="off"
        ></TextField>
      </Box>
    </Box>
  );
};

ToolbarSearch.propTypes = {
  toolbarSearchField: PropTypes.string.isRequired,
  handleToolbarSearchFieldChange: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  toolbarSearchValue: PropTypes.string.isRequired,
  handleToolbarSearchValueChange: PropTypes.func.isRequired,
  handleKeyPress: PropTypes.func.isRequired,
};

export default EnhancedToolbar;
