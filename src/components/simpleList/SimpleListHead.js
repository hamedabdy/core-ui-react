import PropTypes from "prop-types"; // data type checking
import { useState } from "react";


// Styles
import Box from "@mui/material/Box";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const SimpleListHead = (props) => {
  const {
    columns,
    order,
    orderBy,
    onRequestSort,
  } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const [showLocalFilter, setShowLocalFilter] = useState(false);
  const [localFilters, setLocalFilters] = useState(
    columns.reduce((acc, column) => ({ ...acc, [column.element]: "" }), {})
  );
  const handleLocalFilter = () => {
    setShowLocalFilter(!showLocalFilter);
  };

  const handleLocalFilterChange = (event) => {
    const { target } = event;
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      [target.name]: target.value,
    }));
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
              {c.column_label}
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
    </TableHead>
  );
};

SimpleListHead.propTypes = {
  columns: PropTypes.array.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

export default SimpleListHead;
