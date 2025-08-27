import React, {
  useState,
  useEffect,
  // useRef,
  // startTransition,
  // Suspense,
} from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import ApiService from "../services/ApiService";

// Styles
// import Autocomplete from "@mui/material/Autocomplete";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import LinearProgress from "@mui/material/LinearProgress";

// import { styled } from "@mui/system";
import { Paper, Typography, Grid, Box, CircularProgress } from "@mui/material";

// Import Local Components
import PageHeader from "./dynamicForm/PageHeader";
import PageFooter from "./dynamicForm/PageFooter";
import FormContents from "./dynamicForm/FormContents";
import EnhancedCheckBox from "./dynamicForm/EnhancedCheckboxes";

const DynamicForm = () => {
  const navigate = useNavigate();
  const {tableName} = useParams();
  const [searchParams] = useSearchParams();
  const [sysID, setSysID] = useState(searchParams.get("sys_id"));
  const [columns, setColumns] = useState([]);
  const [table, setTable] = useState({}); // table metadata
  const [formData, setFormData] = useState({});
  const [reloadData, setReloadData] = useState(false);
  const [checkboxes, setCheckboxes] = useState({});
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    console.log("DynForm - Start of useEffet !");

    const loadPage = async () => {
      try {
        if (tableName) {
          const cols = await ApiService.getColumns(tableName);
          setColumns(cols.data.rows);
          const table = await ApiService.getTable(tableName);
          setTable(table.data);

          if (sysID && sysID !== "-1") {
            const resp = await ApiService.getData({
              table_name: tableName,
              sys_id: sysID,
            });
            setFormData(resp.data.pop());
          }
        }
      } catch (error) {
        console.error("Error loading page:", error);
        setErrorMessage("Failed to fetch record");
      }
    };

    loadPage();

    if (reloadData) setReloadData(false);
    return () => {
      console.log("DynForm - component is unmounting");
    };
    // eslint-disable-next-line
  }, [tableName, sysID, reloadData]);

  /*
  // TODO event base form update when data changes at server side
  // function useTraceUpdate(props) {
  //   const prev = useRef(props);
  //   useEffect(() => {
  //     const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
  //       if (prev.current[k] !== v) {
  //         ps[k] = [prev.current[k], v];
  //       }
  //       return ps;
  //     }, {});
  //     if (Object.keys(changedProps).length > 0) {
  //       console.log("Changed props:", changedProps);
  //     }
  //     prev.current = props;
  //   });
  // }
*/


  const handleInputChange = (columnName, value) => {
    // Update form data when input values change
    setFormData((prevData) => ({
      ...prevData,
      [columnName]: value,
    }));
  };

  const checkTableNameExists = async (name) => {
    try {
      const response = await ApiService.getTable(name);
      if (response.status === "success" && response.data != null) return true;
      return false;
    } catch (error) {
      console.error("Error checking table name:", error);
      setErrorMessage("Error checking table name:", error);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Directly send a request to your API to insert a new row or column
      const response = await ApiService.addData(tableName, formData);
      if (response.status === "success") {
        setSysID(response.sys_id);
        navigate(`?sys_id=${response.sys_id}`);
        // After saving the form, update the state to trigger a re-render
        setReloadData(true);
      } else {
        setErrorMessage(response.message || "Error inserting row.");
      }
    } catch (error) {
      console.error("Error inserting row:", error);
      setErrorMessage("Error inserting row:", error);
    }
  };

  const insertAndStay = async (event) => {
    event.preventDefault();
    var fd = formData;
    fd.sys_id = "-1";
    fd.sys_created_on =
      fd.sys_created_by =
      fd.sys_updated_on =
      fd.sys_updated_by =
      fd.sys_name =
        "";

    setFormData(fd);
    handleSubmit(event);
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    try {
      const response = await ApiService.deleteData(tableName, formData);
      if (response.status === "success") {
        
          // No history, redirect to the list view of the same table
          navigate(`../${tableName}.list`);
        
      } else {
        setErrorMessage(response.message || "Failed to delete record");
      }
    } catch (error) {
      console.error("Error deleting row:", error);
      setErrorMessage(error.response?.data?.message || "Error deleting record: " + error.message);
    }
  };

  return (
    <Paper
      elevation={0}
      component="form"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <PageHeader
        table={table}
        sysID={sysID}
        formData={formData}
        insertAndStay={insertAndStay}
        handleDelete={handleDelete}
      />

      {errorMessage && (
        <Paper
          elevation={2}
          sx={{
            padding: 2,
            marginBottom: 2,
            marginTop: 2,
            bgcolor: errorMessage.includes("success") ? "success.main" : "error.main",
            color: "error.contrastText",
            marginleft: "10%",
            marginRight: "10%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Typography color="#fff" variant="body1">
            {errorMessage}
          </Typography>
        </Paper>
      )}

      <Box
        key={"box-form"}
        sx={{
          m: 1,
          marginTop: 3,
          padding: "0 10%",
          justifyContent: "center",
        }}
      >
        <Grid container spacing={2}>
          {columns.map((c) => (
            <Grid item xs={6} key={`grid-input-${c.sys_id}`}>
              {c.internal_type === "boolean" ? (
                <EnhancedCheckBox
                  c={c}
                  checkboxes={checkboxes}
                  formData={formData}
                  setCheckboxes={setCheckboxes}
                  setFormData={setFormData}
                />
              ) : (
                <FormContents
                  c={c}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  error={error}
                  setError={setError}
                />
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
      <PageFooter insertAndStay={insertAndStay} handleDelete={handleDelete} />
    </Paper>
  );
};

export default DynamicForm;
