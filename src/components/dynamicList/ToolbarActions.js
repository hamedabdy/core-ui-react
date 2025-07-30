import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  // IconButton,
  // Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";

const ToolbarActions = ({ tableName, numSelected }) => {
  /*
    if (numSelected > 0) {
    return (
      <Tooltip title="Delete">
        <IconButton>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    );
  }
    */
  return (
    <>
      {/* Dropdown for form actions */}
      <FormControl sx={{ minWidth: 200, marginRight: 2 }} size="small">
        <InputLabel id="form-actions-label">Actions</InputLabel>
        <Select
          labelId="form-actions-label"
          id="form-actions-dropdown"
          label="Actions"
          defaultValue=""
          // onChange={handleActionChange} // Placeholder for future actions
        >
          <MenuItem value="">
            <em>Delete {numSelected} records</em>
          </MenuItem>
          {/* Future actions can be added here */}
        </Select>
      </FormControl>
    </>
  );
};

ToolbarActions.propTypes = {
  tableName: PropTypes.string.isRequired,
  numSelected: PropTypes.number.isRequired,
};

export default ToolbarActions;
