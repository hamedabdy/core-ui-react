import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ApiService from '../services/ApiService';

// Material-UI components
import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Switch from '@mui/material/Switch';

// Local components
import SimpleListHead from './simpleList/SimpleListHead';
import SimpleTableBody from './simpleList/SimpleTableBody';
import SimpleListToolbar from './simpleList/SimpleListToolbar';
import TablePaginationActions from './dynamicList/EnhancedTablePagination';
import QueryFilter from "./dynamicList/QueryFilter";

function SimpleList({ tableName }) {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('sys_updated_on');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [sysparmQuery, setSysparmQuery] = useState("");
  const [sysparmFields, setSysparmFields] = useState("");

  const [table, setTable] = useState({}); 

  const fetchData = async (query = '') => {
    try {
      setLoading(true);
      const resp = await ApiService.getData({
        table_name: tableName,
        sysparm_query: query
      });
      setData(resp.data);
    } catch (error) {
      setError(`Error loading data: ${error.message}`);
      console.log("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!tableName) return;
    setLoading(true);
    setError(null);
    
    const getData = async () => {
      try {
        const cols = await ApiService.getColumns(tableName);
        setColumns(cols.data.rows);
        const tableInfo = await ApiService.getTable(tableName);
        setTable(tableInfo.data);
        await fetchData();
      } catch (error) {
        setError(`Error loading data: ${error.message}`);
        console.log("Error in SimpleList: ", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [tableName]);

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
  
  const handleFilterChange = (query) => {
    setSysparmQuery(query);
    fetchData(query);
  };
  
  // Handler for column selection from EnhancedToolbar
  const handleColumnsChange = (selectedElements) => {
    setVisibleColumnElements(selectedElements);
    // Update sysparm_fields in URL and state
    const newSysparmFields = selectedElements.join(",");
    setSysparmFields(newSysparmFields);
    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set("sysparm_fields", newSysparmFields);
    // navigate({ search: params.toString() }, { replace: true });
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!tableName) return <div>No table selected.</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!table || !columns || !data) return <div>Loading table data...</div>;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;
  const visibleRows = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <SimpleListToolbar 
          table={table}
        />
        <QueryFilter tableName={tableName} setData={setData} />
        <TableContainer>
          <Table sx={{ minWidth: 750, ...(true && {
                "& th, & td": {
                  padding: "2px 8px",
                  fontSize: "0.80rem",
                  lineHeight: 1.2,
                },
              }), }} size="small">
            <SimpleListHead
              columns={columns}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <SimpleTableBody
              columns={columns}
              visibleRows={visibleRows}
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
}

SimpleList.propTypes = {
  tableName: PropTypes.string.isRequired,
};

export default SimpleList;
