import React, { useState, useEffect } from "react";
import { useOutletContext, useParams, useSearchParams, useNavigate } from "react-router-dom";

// Styles
import { Box, TableContainer, Table, Paper, TablePagination } from "@mui/material";

// IMPORT LOCAL COMPONENTS
import ApiService from "../../services/ApiService";
import { loadListColumnPref, saveListColumnPref } from "../../services/userPreferenceService";
import EnhancedToolbar from "./EnhancedToolbar";
import QueryFilter from "./QueryFilter";
import EnhancedTableHead from "./EnhancedTableHead";
import EnhancedTableBody from "./EnhancedTableBody";
import TablePaginationActions from "./EnhancedTablePagination";
import { useDynamicListState } from "./useDynamicListState";

const DynamicList = () => {
  const { tableName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // OPTIMIZATION: Derive URL state directly, no need for redundant useState
  const sysparmQuery = searchParams.get("sysparm_query") || "";
  const sysparmFields = searchParams.get("sysparm_fields") || "";

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [table, setTable] = useState({}); // table metadata
  
  const listState = useDynamicListState(data, columns, {
    order: "desc",
    orderBy: "sys_updated_on",
  });

  const { setPageTitle } = useOutletContext();

  // OPTIMIZATION: Dedicated effect for page title (prevents unnecessary fetches)
  useEffect(() => {
    if (table?.label) {
      setPageTitle(table.label);
    }
  }, [table, setPageTitle]);

  // ── Effect 1: Fetch data when table, query OR visible fields change ──────────
  useEffect(() => {
    if (!tableName) return;

    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const resp = await ApiService.getData({
          table_name: tableName,
          sysparm_query: sysparmQuery,
          sysparm_fields: sysparmFields,
        });
        // Prevent setting state if component unmounted or URL changed rapidly
        if (isMounted) setData(resp.data || []);
      } catch (error) {
        if (isMounted) console.error(`Error loading data: ${error.message}`);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [tableName, sysparmQuery, sysparmFields]);

  // ── Effect 2: Init columns + preference ONLY on table change (first load) ────
  useEffect(() => {
    if (!tableName) return;

    let isMounted = true;
    const controller = new AbortController();

    const initColumns = async () => {
      try {
        const [colsResp, tableInfo, pref] = await Promise.all([
          ApiService.getColumns(tableName),
          ApiService.getTable(tableName),
          loadListColumnPref(tableName),
        ]);

        if (!isMounted) return;

        const allColumns = colsResp?.data?.rows || [];
        setColumns(allColumns);
        setTable(tableInfo?.data || {});

        const currentUrlFields = searchParams.get("sysparm_fields");

        // Apply preference if URL doesn't explicitly override it
        if (!currentUrlFields && pref?.columns?.length) {
          const valid = pref.columns.filter(el => allColumns.some(c => c.element === el));
          if (valid.length) {
            listState.setVisibleColumnElements(valid);
            // Sync URL silently
            const params = new URLSearchParams(searchParams);
            params.set("sysparm_fields", valid.join(","));
            navigate({ search: params.toString() }, { replace: true });
            return;
          }
        }

        // No preference or URL override — show all columns
        const allElements = allColumns.map(col => col.element);
        listState.setVisibleColumnElements(allElements);
        
        if (!currentUrlFields) {
          const params = new URLSearchParams(searchParams);
          params.set("sysparm_fields", allElements.join(","));
          navigate({ search: params.toString() }, { replace: true });
        }

      } catch (error) {
        if (isMounted) console.error(`Error loading columns: ${error.message}`);
      }
    };

    initColumns();

    return () => {
      isMounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName]);

  const handleFilterChange = (query) => {
    // OPTIMIZATION: Update URL. The useEffect will automatically trigger fetchData() 
    // with the new sysparmQuery. This fixes a state race condition.
    const params = new URLSearchParams(searchParams);
    params.set("sysparm_query", query);
    navigate({ search: params.toString() });
  };

  const handleColumnsChange = async (selectedElements) => {
    listState.setVisibleColumnElements(selectedElements);
    const newSysparmFields = selectedElements.join(",");

    const params = new URLSearchParams(searchParams);
    params.set("sysparm_fields", newSysparmFields);
    navigate({ search: params.toString() }, { replace: true });

    // Persist preference — fire and forget
    try {
      await saveListColumnPref(tableName, selectedElements);
    } catch (err) {
      console.error(`Failed to save column preference: ${err.message}`);
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      <Paper sx={{ width: "100%", mb: 2, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1 }}>
        <EnhancedToolbar
          columns={columns}
          numSelected={listState.selected.length}
          tableName={tableName}
          table={table}
          onColumnsChange={handleColumnsChange}
          onFilterChange={handleFilterChange}
          visibleColumnElements={listState.visibleColumnElements}
        />
        <QueryFilter tableName={tableName} setData={setData} />
        
        <TableContainer component={Paper} elevation={1} sx={{ flex: 1, overflow: "auto" }}>
          <Table
            stickyHeader
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
              columns={listState.filteredColumns}
              visibleRows={listState.visibleRows}
              numSelected={listState.selected.length}
              order={listState.order}
              orderBy={listState.orderBy}
              onSelectAllClick={listState.handleSelectAllClick}
              onRequestSort={listState.handleRequestSort}
              rowCount={listState.filteredColumns.length}
              onFilterChange={handleFilterChange}
            />
            <EnhancedTableBody
              columns={listState.filteredColumns}
              visibleRows={listState.visibleRows}
              isSelected={listState.isSelected}
              handleClick={(event, id) => listState.handleClick(event, id)}
              emptyRows={listState.emptyRows}
              tableName={tableName}
            />
          </Table>
        </TableContainer>
        
        <Box sx={{ flexShrink: 0 }}>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={data.length}
            rowsPerPage={listState.rowsPerPage}
            page={listState.page}
            onPageChange={listState.handleChangePage}
            onRowsPerPageChange={listState.handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default DynamicList;