import {useState, useEffect, } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Paper, Typography, Grid, Box, Button } from "@mui/material";

// Import Local Components
import ApiService from "../../services/ApiService";
import PageHeader from "./PageHeader";
import PageFooter from "./PageFooter";
import FormContents from "./FormContents";
import FormLayoutConfig from "./FormLayoutConfig";

const DynamicForm = () => {
  const navigate = useNavigate();
  const {tableName} = useParams();
  const [searchParams] = useSearchParams();
  const [sysID, setSysID] = useState(searchParams.get("sys_id"));
  const [columns, setColumns] = useState([]);
  const [table, setTable] = useState({}); // table metadata
  const [formData, setFormData] = useState({});
  const [reloadData, setReloadData] = useState(false);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // NEW: State for Form Layout Modal
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [formLayout, setFormLayout] = useState([]);
  const [layoutSysId, setLayoutSysId] = useState(null); // To track if we insert or update

  useEffect(() => {
    console.debug("DynForm - Start of useEffet !");

    const loadPage = async () => {
      try {
        if (tableName) {
          const cols = await ApiService.getColumns(tableName);
          setColumns(cols.data.rows);
          const table = await ApiService.getTable(tableName);
          setTable(table.data);

          // NEW: Fetch Form Layout from sys_ui_form
          try {
            // Assuming your ApiService.getData supports sysparm_query
            const layoutResp = await ApiService.getData({ 
              table_name: "sys_ui_form", 
              sysparm_query: `name=${tableName}^view=Default view` 
            });
            
            if (layoutResp.data && layoutResp.data.length > 0) {
              const layoutRecord = layoutResp.data[0];
              setLayoutSysId(layoutRecord.sys_id);
              setFormLayout(JSON.parse(layoutRecord.value || "[]"));
            } else {
              setLayoutSysId(null);
              setFormLayout([]); // No layout saved yet
            }
          } catch (layoutErr) {
            console.error("Error fetching form layout:", layoutErr);
            setFormLayout([]); // Fallback to empty
          }

          if (sysID && sysID !== "-1") {
            const resp = await ApiService.getData({ table_name: tableName, sys_id: sysID });
            const payload = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.data?.data) ? resp.data.data : [resp?.data?.data ?? resp?.data]);
            const record = payload[0];
            if (!record)
              throw new Error("Record not found");
            setFormData(record);
          }
        }
      } catch (error) {
        console.error("Error loading page:", error);
        setErrorMessage(error.message || "Error loading page");
      }
    };

    loadPage();

    if (reloadData) setReloadData(false);
    return () => {
      console.debug("DynForm - component is unmounting");
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
      setErrorMessage(error.message || "Error inserting row.");
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

  // NEW: Handler to save layout configuration
  const handleSaveLayout = async (layoutConfig, viewName) => {
    try {
      const payload = {
        name: tableName,
        view: viewName,
        value: JSON.stringify(layoutConfig)
      };

      if (layoutSysId) {
        // Update existing record
        payload.sys_id = layoutSysId;
        await ApiService.updateData("sys_ui_form", payload);
      } else {
        // Insert new record
        const resp = await ApiService.addData("sys_ui_form", payload);
        if (resp.sys_id) setLayoutSysId(resp.sys_id);
      }
      
      setFormLayout(layoutConfig); // Update local state
      // Optional: setReloadData(true) if you want the form to immediately re-render based on new layout
    } catch (error) {
      console.error("Error saving form layout:", error);
      setErrorMessage("Failed to save form layout: " + error.message);
    }
  };

  if (errorMessage === "Record not found") {
  return (
    <Paper elevation={0} sx={{ padding: 4, textAlign: "center", marginTop: 8 }}>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        Record Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        The record with sys_id <strong>{sysID}</strong> does not exist in <strong>{tableName}</strong>.
      </Typography>
      <Button variant="outlined" onClick={() => navigate(`../${tableName}.list`)}>
        Back to List
      </Button>
    </Paper>
  );
}

  return (
    <Paper
      elevation={0}
      component="form"
      autoComplete="off"
      onSubmit={handleSubmit}
      sx={{
        height: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PageHeader
        table={table}
        sysID={sysID}
        formData={formData}
        insertAndStay={insertAndStay}
        handleDelete={handleDelete}
        onFormLayoutClick={() => setIsLayoutModalOpen(true)} // NEW: Pass modal opener
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
          padding: "0 8%",
          justifyContent: "center",
          width: '100%',
          overflowX: 'hidden',
          // Make this the scroll container so the footer scrolls into view
          position: 'relative',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 220px)'
        }}
      >
        <Grid container spacing={3}>
          {formLayout && formLayout.length > 0 ? (
            // Render according to saved layout sections
            formLayout.map((section, sidx) => {
              // section: { name, type, fields: ["col1","col2"] }
              const isTwoCol = section.type === 2;
              return (
                <Grid item xs={12} key={`section-${sidx}`} sx={{ mb: 2 }}>
                  <Paper elevation={0} sx={{ p: 1, bgcolor: "transparent" }}>
                    <Typography variant="h6">{section.name}</Typography>
                  </Paper>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {Array.isArray(section.fields) && section.fields.map((fld) => {
                      const col = columns.find((c) => c.element === fld || c.element === fld.element || c.name === fld || c.column_label === fld);
                      if (!col) return null;
                      return (
                        <Grid item xs={isTwoCol ? 6 : 12} key={`grid-input-${col.sys_id}`}>
                          <FormContents
                            c={col}
                            formData={formData}
                            setFormData={setFormData}
                            handleInputChange={handleInputChange}
                            error={error}
                            setError={setError}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Grid>
              );
            })
          ) : (
            // Fallback: render all columns in default two-column grid
            columns.map((c) => (
              <Grid item xs={6} key={`grid-input-${c.sys_id}`}>
                <FormContents
                  c={c}
                  formData={formData}
                  setFormData={setFormData}
                  handleInputChange={handleInputChange}
                  error={error}
                  setError={setError}
                />
              </Grid>
            ))
          )}
        </Grid>

        {/* Footer inside the scroll container so it stays visible and reachable */}
        <PageFooter insertAndStay={insertAndStay} handleDelete={handleDelete} />
      </Box>
      {/* NEW: Render the Form Layout Modal */}
      <FormLayoutConfig
        open={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        onSave={handleSaveLayout}
        columns={columns}
        initialLayout={formLayout}
        tableName={tableName}
      />
    </Paper>
  );
};

export default DynamicForm;
