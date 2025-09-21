import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Tooltip,
  IconButton
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ApiService from '../../services/ApiService';
import FormContents from '../dynamicForm/FormContents';

const SimpleForm = ({ tableName, sysId }) => {
  const [formData, setFormData] = useState({});
  const [columns, setColumns] = useState([]);
  const [table, setTable] = useState({}); // table metadata
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (tableName) {
          const cols = await ApiService.getColumns(tableName);
          setColumns(cols.data.rows);
          const table = await ApiService.getTable(tableName);
          setTable(table.data);

          if (sysId && sysId !== "-1") {
            const resp = await ApiService.getData({table_name: tableName, sys_id: sysId,});
            setFormData(resp.data.pop());
          }
        }
      } catch (err) {
        console.error("Error fetching data for SimpleForm:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (tableName && sysId) {
      fetchData();
    }
  }, [tableName, sysId]);

  const handleInputChange = (columnName, value) => {
    // Update form data when input values change
    setFormData((prevData) => ({
      ...prevData,
      [columnName]: value,
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 0, backgroundColor: "#f5f5f5" }} elevation={1}>
        <Tooltip title={`Table: ${table.label}`} placement="top">
          <Typography variant="h6" sx={{ mb: 0, pl: 1, pt: 1 }}>
            {table.label}
          </Typography>
        </Tooltip>
        {sysId && sysId !== "-1" && (
          <IconButton
            aria-label="open in new window"
            onClick={() => window.open(`./${tableName}.form?sys_id=${sysId}`, '_blank')}
            size="small"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>
      <Grid container spacing={2} sx={{ p: 2 }}>
        {columns.map((column) => (
          <Grid item xs={12} sm={6} key={column.element}>
            <FormContents
                  c={column}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  error={error}
                  setError={setError}
                />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SimpleForm;
