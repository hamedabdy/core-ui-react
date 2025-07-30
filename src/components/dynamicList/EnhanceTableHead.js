import PropTypes from "prop-types"; // data type checking
import React, { useState } from "react";

// Styles
import Box from "@mui/material/Box";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import { visuallyHidden } from "@mui/utils";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const EnhancedTableHead = (props) => {
  const {
    columns,
    // visibleRows,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;

  const [showLocalFilter, setShowLocalFilter] = useState(true);
  const [localFilters, setLocalFilters] = useState(
    columns.reduce((acc, column) => ({ ...acc, [column.field]: "" }), {})
  );

  const handleLocalFilter = () => {
    setShowLocalFilter(!showLocalFilter);
  };

  const handleLocalFilterChange = (event) => {
    const { target } = event;
    setLocalFilters((localFilters) => ({
      ...localFilters,
      [target.name]: target.value,
    }));
    console.log("event target => %s : %s", target.name, target.value);
  };

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Tooltip aria-label="Search list">
            <IconButton onClick={handleLocalFilter}>
              <SearchOutlinedIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell padding="checkbox">
          <Checkbox
            id="table-select-all"
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all records",
            }}
          />
        </TableCell>
        {columns.map((c) => (
          <TableCell
            key={`table-head-label-${c.sys_id}`}
            // align={headCell.numeric ? 'right' : 'left'}
            // padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === c.element ? order : false}
          >
            <TableSortLabel
              active={orderBy === c.element}
              direction={orderBy === c.element ? order : "asc"}
              onClick={createSortHandler(c.element)}
              sx={{ fontSize: "11pt", fontWeight: "600" }}
              key={`table-head-sort-label-${c.sys_id}`}
            >
              {c.column_label} |{c.element}
              {orderBy === c.element ? (
                <Box
                  component="span"
                  sx={visuallyHidden}
                  key={`table-head-sort-span-${c.sys_id}`}
                >
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
      <TableRow sx={{ display: showLocalFilter ? "" : "none" }}>
        <TableCell
          padding="checkbox"
          sx={{ backgroundColor: "#EFEFEF" }}
          key="search-icon-cell"
        ></TableCell>
        <TableCell
          padding="checkbox"
          sx={{ backgroundColor: "#EFEFEF" }}
          key="select-all-checkbox-cell"
        ></TableCell>
        {columns.map((c) => (
          <TableCell
            sx={{ backgroundColor: "#EFEFEF" }}
            key={`local-filter-cell-${c.sys_id}`}
          >
            <TextField
              key={`local-filter-${c.sys_id}`}
              size="small"
              placeholder="Search"
              value={localFilters[c.element] || ""}
              name={c.element}
              label="Search"
              onChange={handleLocalFilterChange}
            ></TextField>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

EnhancedTableHead.propTypes = {
  columns: PropTypes.array.isRequired,
  visibleRows: PropTypes.array.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default EnhancedTableHead;
