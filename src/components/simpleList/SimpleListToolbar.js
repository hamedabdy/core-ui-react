import PropTypes from "prop-types";
import { useState } from "react";
import { AppBar, Toolbar, Typography, TextField, Select,   MenuItem, Box, } from "@mui/material";

const SimpleListToolbar = (props) => {
  const { table, columns, onFilterChange } = props;
  const [toolbarSearchValue, settoolbarSearchValue] = useState("");
    const [toolbarSearchField, setToolbarSearchField] = useState(columns && columns.length > 0 ? columns[0].element : "name");

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
      sx={{ position: "relative", zIndex: 100, padding: 1, backgroundColor: "#f5f5f5" }}
    >
      <Toolbar>
        <Typography
          sx={{
            flex: "1 1 100%",
            fontWeight: "bold",
            textTransform: "capitalize",
          }}
          variant="h6"
          id="tableTitle"
          component="div"
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
      </Toolbar>
    </AppBar>
  );
};

SimpleListToolbar.propTypes = {
  columns: PropTypes.array.isRequired,
  table: PropTypes.object,
  onFilterChange: PropTypes.func,
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

export default SimpleListToolbar;
