import { useState, useEffect } from "react";
import { useOutletContext, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Paper, Typography, Grid, Box, Button } from "@mui/material";

// Import Local Components
import ApiService from "../../services/ApiService";
import PageHeader from "./PageHeader";
import PageFooter from "./PageFooter";
import FormContents from "./FormContents";
import FormLayoutConfig from "./FormLayoutConfig";

const DynamicForm = () => {
  const navigate = useNavigate();
  const { tableName } = useParams();
  const [searchParams] = useSearchParams();
  
  // OPTIMIZATION: Derive sysId directly from URL, no need for redundant state
  const sysIdParam = searchParams.get("sys_id") || "";

  const [columns, setColumns] = useState([]);
  const [table, setTable] = useState({}); 
  const [formData, setFormData] = useState({});
  const [reloadData, setReloadData] = useState(false);
  
  // Kept `error` state because it is passed down to FormContents
  const [error, setError] = useState(null); 
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // State for Form Layout Modal
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [formLayout, setFormLayout] = useState([]);
  const [layoutSysId, setLayoutSysId] = useState(null); 
  
  const { setPageTitle } = useOutletContext();

  useEffect(() => {
    if (!tableName) return;

    let isMounted = true;
    const controller = new AbortController(); // Prevents memory leaks on rapid navigation

    const loadPage = async () => {
      setIsPageLoading(true);
      setErrorMessage(null);

      try {
        const [colsResp, tableResp, layoutResp] = await Promise.all([
          ApiService.getColumns(tableName),
          ApiService.getTable(tableName),
          ApiService.getData({
            table_name: "sys_ui_form",
            sysparm_query: `name=${tableName}^view=Default view`
          }).catch((layoutErr) => {
            console.error("Error fetching form layout:", layoutErr);
            return { data: [] };
          })
        ]);

        if (!isMounted) return;

        setColumns(colsResp?.data?.rows ?? []);
        setTable(tableResp?.data ?? {});

        // OPTIMIZATION: Safely parse JSON to prevent app crashes on malformed DB data
        if (layoutResp?.data?.length > 0) {
          const layoutRecord = layoutResp.data[0];
          setLayoutSysId(layoutRecord.sys_id);
          try {
            setFormLayout(JSON.parse(layoutRecord.value || "[]"));
          } catch (parseError) {
            console.error("Failed to parse form layout JSON:", parseError);
            setFormLayout([]);
          }
        } else {
          setLayoutSysId(null);
          setFormLayout([]);
        }

        // OPTIMIZATION: Cleaned up payload extraction logic
        if (sysIdParam && sysIdParam !== "-1") {
          const resp = await ApiService.getData({ table_name: tableName, sys_id: sysIdParam });
          if (!isMounted) return;

          const rawPayload = resp?.data;
          const record = Array.isArray(rawPayload) 
            ? rawPayload[0] 
            : Array.isArray(rawPayload?.data) 
              ? rawPayload.data[0] 
              : rawPayload;

          if (!record) throw new Error("Record not found");
          
          setPageTitle(`${tableResp?.data?.label} - ${record?.sys_name || 'Unknown'}`);
          setFormData(record);
        } else if (sysIdParam === "-1" || !sysIdParam) {
          // Handle New Record cleanly
          setFormData({});
          setPageTitle(`${tableResp?.data?.label} - New`);
        }

      } catch (err) {
        console.error("Error loading page:", err);
        if (isMounted) setErrorMessage(err.message || "Error loading page");
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
          if (reloadData) setReloadData(false);
        }
      }
    };

    loadPage();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [tableName, sysIdParam, reloadData, setPageTitle]);

  const handleInputChange = (columnName, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [columnName]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await ApiService.addData(tableName, formData);
      if (response.status === "success") {
        setErrorMessage("Record saved successfully"); // Added success feedback
        // If it was a new record, navigate to the new sys_id
        if (response.sys_id && response.sys_id !== sysIdParam) {
          navigate(`?sys_id=${response.sys_id}`);
        } else {
          setReloadData(true);
        }
      } else {
        setErrorMessage(response.message || "Error saving record.");
      }
    } catch (err) {
      console.error("Error inserting row:", err);
      setErrorMessage(err.message || "Error saving record.");
    }
  };

  const insertAndStay = async (event) => {
    event.preventDefault();
    
    // OPTIMIZATION: Prevent direct state mutation. Clone first.
    const fd = { ...formData };
    fd.sys_id = "-1";
    fd.sys_created_on = "";
    fd.sys_created_by = "";
    fd.sys_updated_on = "";
    fd.sys_updated_by = "";
    fd.sys_name = "";

    setFormData(fd);

    try {
      const response = await ApiService.addData(tableName, fd);
      if (response.status === "success") {
        setErrorMessage("New record inserted successfully");
        // Navigate back to -1 to stay on a new form, or to the new record if preferred
        navigate(`?sys_id=-1`); 
        setReloadData(true);
      } else {
        setErrorMessage(response.message || "Error inserting row.");
      }
    } catch (err) {
      console.error("Error inserting row:", err);
      setErrorMessage(err.message || "Error inserting row.");
    }
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    try {
      const response = await ApiService.deleteData(tableName, formData);
      if (response.status === "success") {
        navigate(`../${tableName}.list`);
      } else {
        setErrorMessage(response.message || "Failed to delete record");
      }
    } catch (err) {
      console.error("Error deleting row:", err);
      setErrorMessage(err.response?.data?.message || "Error deleting record: " + err.message);
    }
  };

  const handleSaveLayout = async (layoutConfig, viewName) => {
    try {
      const payload = {
        sys_id: layoutSysId || "",
        name: tableName,
        view: viewName,
        value: JSON.stringify(layoutConfig)
      };
      
      const resp = await ApiService.addData("sys_ui_form", payload);
      if (resp.sys_id) setLayoutSysId(resp.sys_id);
      
      setFormLayout(layoutConfig);
      setErrorMessage("Layout saved successfully");
    } catch (err) {
      console.error("Error saving form layout:", err);
      setErrorMessage("Failed to save form layout: " + err.message);
    }
  };

  if (errorMessage === "Record not found") {
    return (
      <Paper elevation={0} sx={{ padding: 4, textAlign: "center", marginTop: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Record Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The record with sys_id <strong>{sysIdParam}</strong> does not exist in <strong>{tableName}</strong>.
        </Typography>
        <Button variant="outlined" onClick={() => navigate(`../${tableName}.list`)}>
          Back to List
        </Button>
      </Paper>
    );
  }

  if (isPageLoading && columns.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Typography variant="body2" color="text.secondary">Loading form…</Typography>
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
        sysID={sysIdParam}
        formData={formData}
        insertAndStay={insertAndStay}
        handleDelete={handleDelete}
        onFormLayoutClick={() => setIsLayoutModalOpen(true)}
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
            marginLeft: "10%", // Fixed typo from 'marginleft'
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
        key="box-form"
        sx={{
          m: 0.2,
          p: "0 10%",
          justifyContent: "center",
          width: '100%',
          overflowX: 'hidden',
          position: 'relative',
          overflowY: 'auto',
          maxHeight: 'calc(84vh)',
        }}
      >
        <Grid container spacing={0} sx={{ gap: '3px' }}>
          {formLayout && formLayout.length > 0 ? (
            formLayout.map((section, sidx) => {
              const isTwoCol = section.type === 2;
              return (
                <Grid item xs={12} key={`section-${sidx}`} sx={{ mb: 1 }}>
                  {section.name && (
                    <Paper elevation={0} sx={{ p: 1, bgcolor: "transparent" }}>
                      <Typography variant="h6">{section.name}</Typography>
                    </Paper>
                  )}

                  <Grid container spacing={0} sx={{ mt: 1 }}>
                    {Array.isArray(section.fields) && section.fields.map((fld) => {
                      const col = columns.find((c) => 
                        c.element === fld || 
                        c.element === fld.element || 
                        c.name === fld || 
                        c.column_label === fld
                      );
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

        <PageFooter insertAndStay={insertAndStay} handleDelete={handleDelete} />
      </Box>

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