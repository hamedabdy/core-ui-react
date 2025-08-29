import PropTypes from "prop-types"; // data type checking
import { useState } from "react";

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
    onFilterChange
  } = props;

  const [showLocalFilter, setShowLocalFilter] = useState(false);
  const [localFilters, setLocalFilters] = useState(
    columns.reduce((acc, column) => ({ ...acc, [column.element]: "" }), {})
  );

  const handleLocalFilter = () => {
    setShowLocalFilter(!showLocalFilter);
  };

  const parseFilterValue = (value) => {
    if (!value) return null;
    
    const operators = {
      '!=': 'NOT LIKE',
      '=': 'LIKE',
      '*': 'CONTAINS',
      '!*': 'NOT CONTAINS',
      '%': 'ENDSWITH',
      '!%': 'NOT ENDSWITH'
    };

    // Check for negation
    let isNegated = value.startsWith('!');
    let actualValue = isNegated ? value.substring(1) : value;
    
    // Check for operators
    let operator = 'STARTSWITH'; // default
    for (const [symbol, op] of Object.entries(operators)) {
      if (actualValue.startsWith(symbol)) {
        operator = op;
        actualValue = actualValue.substring(symbol.length);
        break;
      }
    }
    
    return {
      operator,
      value: actualValue.trim()
    };
  };

  const handleLocalFilterChange = (event) => {
    const { target } = event;
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      [target.name]: target.value,
    }));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      const queries = Object.entries(localFilters)
        .filter(([_, value]) => value.trim())
        .map(([field, value]) => {
          const filter = parseFilterValue(value);
          if (!filter) return null;
          return `${field}${filter.operator}${filter.value}`;
        })
        .filter(Boolean);

      if (queries.length > 0) {
        onFilterChange(queries.join('^'));
      } else {
        onFilterChange('');
      }
    }
  };

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead sx={{ "& .MuiTableCell-head": { backgroundColor: "#ddddddc7", borderBottom: 1, borderColor: "#ccc"}, }}>
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
          key="search-icon-cell"
        ></TableCell>
        <TableCell
          padding="checkbox"
          key="select-all-checkbox-cell"
        ></TableCell>
        {columns.map((c) => (
          <TableCell
            key={`local-filter-cell-${c.sys_id}`}
          >
            <TextField
              key={`local-filter-${c.sys_id}`}
              size="small"
              sx={{ 
                width: "100%",
                '& .MuiInputBase-root': {
                  minHeight: 20,
                  lineHeight: 0,
                  '& input': {
                    py: '8px !important',
                    height: 'auto',
                  },
                  '& fieldset': {
                    borderRadius: .5,
                  }
                },
              }}
              placeholder="Search"
              value={localFilters[c.element] || ""}
              name={c.element}
              onChange={handleLocalFilterChange}
              onKeyPress={handleKeyPress}
            />
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
  onFilterChange: PropTypes.func.isRequired,
};

export default EnhancedTableHead;
