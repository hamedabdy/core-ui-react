// import PropTypes from "prop-types"; // data type checking
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import ApiService from "../services/ApiService";

// Styles
import Box from "@mui/material/Box";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import Paper from "@mui/material/Paper";
// import CircularProgress from "@mui/material/CircularProgress";
import TablePagination from "@mui/material/TablePagination";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import Switch from "@mui/material/Switch";

// IMPORT LOCAL COMPONENTS
import EnhancedToolbar from "./dynamicList/EnhancedToolbar";
import QueryFilter from "./dynamicList/QueryFilter";
import EnhancedTableHead from "./dynamicList/EnhancedTableHead";
import EnhancedTableBody from "./dynamicList/EnhancedTableBody";
import TablePaginationActions from "./dynamicList/EnhancedTablePagination";
import Utils from "./dynamicList/Utils";

const DynamicList = () => {
  const { tableName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sysparmQuery, setSysparmQuery] = useState(searchParams.get("sysparm_query"));
  const [sysparmFields, setSysparmFields] = useState(searchParams.get("sysparm_fields") || "");
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [table, setTable] = useState({}); // table metadata
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("sys_updated_on");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getData = async () => {
      try {
        setLoading(true);
        setError(null);
        const cols = await ApiService.getColumns(tableName);
        setColumns(cols.data.rows);
        // Always fetch data with sysparm_fields if present
        const resp = await ApiService.getData({
          table_name: tableName,
          sysparm_query: sysparmQuery,
          sysparm_fields: sysparmFields
        });
        setData(resp.data);
        const tableInfo = await ApiService.getTable(tableName);
        setTable(tableInfo.data);
      } catch (error) {
        setError(`Error loading data: ${error.message}`);
        console.log("Error in DynamicList: ", error);
      } finally {
        setLoading(false);
      }
    };

  // Add state for visible columns (elements)
  const [visibleColumnElements, setVisibleColumnElements] = useState([]);
  // When columns are loaded, set all as visible by default or from sysparm_fields
  useEffect(() => {
    if (columns && columns.length > 0) {
      if (sysparmFields) {
        setVisibleColumnElements(sysparmFields.split(",").filter(Boolean));
      } else {
        setVisibleColumnElements(columns.map(col => col.element));
      }
    }
  }, [columns, sysparmFields]);

  // Fetch columns and data from server, using sysparm_fields if present
  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, [tableName, sysparmQuery, sysparmFields]);

  const handleFilterChange = (query) => {
    setSysparmQuery(query);
    getData();
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = columns.map((n) => n.sys_id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Handler for column selection from EnhancedToolbar
  const handleColumnsChange = (selectedElements) => {
    setVisibleColumnElements(selectedElements);
    // Update sysparm_fields in URL and state
    const newSysparmFields = selectedElements.join(",");
    setSysparmFields(newSysparmFields);
    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set("sysparm_fields", newSysparmFields);
    navigate({ search: params.toString() }, { replace: true });
  };

  // Only show columns and data for selected columns, preserving order from visibleColumnElements
  const filteredColumns = visibleColumnElements
    .map(element => columns.find(col => col.element === element))
    .filter(Boolean);
  const filteredData = data.map(row => {
    const filteredRow = {};
    visibleColumnElements.forEach(el => {
      filteredRow[el] = row[el];
    });
    // Always include sys_id for row keys/links
    if (row.sys_id) filteredRow.sys_id = row.sys_id;
    return filteredRow;
  });

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      Utils.stableSort(filteredData, Utils.getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [order, orderBy, page, rowsPerPage, filteredData]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2, overflow: "hidden" }}>
        <EnhancedToolbar
          columns={columns}
          numSelected={selected.length}
          tableName={tableName}
          table={table}
          onColumnsChange={handleColumnsChange}
          onFilterChange={handleFilterChange}
        />
        <QueryFilter tableName={tableName} setData={setData} />
        <TableContainer
          component={Paper}
          elevation={1}
          sx={{ overflow: "auto" }}
        >
          <Table
            size="small"
            sx={{
              minWidth: 750,
                "& th, & td": {
                  padding: "2px 8px",
                  fontSize: "0.80rem",
                  lineHeight: 1.2,
                },
            }}
          >
            <EnhancedTableHead
              columns={filteredColumns}
              visibleRows={visibleRows}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={filteredColumns.length}
              onFilterChange={handleFilterChange}
            />
            <EnhancedTableBody
              columns={filteredColumns}
              visibleRows={visibleRows}
              isSelected={isSelected}
              handleClick={(event, id) => {
                handleClick(event, id);
              }}
              emptyRows={emptyRows}
              tableName={tableName}
            />
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
        />
      </Paper>
    </Box>
  );
};

export default DynamicList;
