// import PropTypes from "prop-types"; // data type checking
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

// Styles
import {Box, TableContainer, Table, Paper, TablePagination} from "@mui/material";

// IMPORT LOCAL COMPONENTS
import ApiService from "../../services/ApiService";
import { loadListColumnPref, saveListColumnPref } from "../../services/userPreferenceService";
import EnhancedToolbar from "../dynamicList/EnhancedToolbar";
import QueryFilter from "../dynamicList/QueryFilter";
import EnhancedTableHead from "../dynamicList/EnhancedTableHead";
import EnhancedTableBody from "../dynamicList/EnhancedTableBody";
import TablePaginationActions from "../dynamicList/EnhancedTablePagination";
import Utils from "./Utils";

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
  // Add state for visible columns (elements)
  const [visibleColumnElements, setVisibleColumnElements] = useState([]);

  // Fetches only the row data — called when fields/query change
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const resp = await ApiService.getData({
      table_name:     tableName,
      sysparm_query:  sysparmQuery,
      sysparm_fields: sysparmFields,
    });
    setData(resp.data);
  } catch (error) {
    setError(`Error loading data: ${error.message}`);
    console.error("Error fetching data:", error);
  } finally {
    setLoading(false);
  }
};

// Loads columns + preference — called only on first load / table change
  const initColumns = async () => {
    try {
      setLoading(true);
      setError(null);

      const [colsResp, tableInfo, pref] = await Promise.all([
        ApiService.getColumns(tableName),
        ApiService.getTable(tableName),
        loadListColumnPref(tableName),
      ]);

      const allColumns = colsResp.data.rows;
      setColumns(allColumns);
      setTable(tableInfo.data);

      // Apply preference or default to all columns
      if (pref?.columns?.length) {
        const valid = pref.columns.filter(el => allColumns.some(c => c.element === el));
        if (valid.length) {
          setVisibleColumnElements(valid);
          setSysparmFields(valid.join(","));
          return;
        }
      }
      // No preference — show all columns
      const allElements = allColumns.map(col => col.element);
      setVisibleColumnElements(allElements);
      setSysparmFields(allElements.join(","));

    } catch (error) {
      setError(`Error loading columns: ${error.message}`);
      console.error("Error in initColumns:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Effect 1: Fetch data when table, query OR visible fields change ──────────
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [tableName, sysparmQuery, sysparmFields]);

  
  // ── Effect 2: Init columns + preference ONLY on table change (first load) ────
  useEffect(() => {
    initColumns();
    // eslint-disable-next-line
  }, [tableName]);

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
  const handleColumnsChange = async (selectedElements) => {
    // Update UI state
    setVisibleColumnElements(selectedElements);
    const newSysparmFields = selectedElements.join(",");
    setSysparmFields(newSysparmFields);

    // Update URL (for bookmarking/sharing)
    const params = new URLSearchParams(window.location.search);
    params.set("sysparm_fields", newSysparmFields);
    navigate({ search: params.toString() }, { replace: true });

    // Persist preference — fire and forget
    try {
      await saveListColumnPref(tableName, selectedElements);
    } catch (err) {
      console.error("[DynamicList] Failed to save column preference:", err);
    }
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
          visibleColumnElements={visibleColumnElements}
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
