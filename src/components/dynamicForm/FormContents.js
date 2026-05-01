import {useState} from "react";
import { Grid, Typography, TextField } from "@mui/material";
import ReferenceField from "./ReferenceField";
import EnhancedCheckBox from "../dynamicForm/EnhancedCheckboxes";

const FormContents = ({ c, formData, setFormData, handleInputChange, error, setError }) => {
  
  // Ensure c.mandatory is properly handled
  const isMandatory = c.mandatory;
  const renderField = () => {
    
    if (c.internal_type === 'reference') {
      return (
        <ReferenceField
          value={formData[c.element]}
          onChange={(e) => {
            handleInputChange(c.element, e.target.value);
            if (e.target.value) setError(false);
          }}
          column={c}
          error={error}
          helperText={error ? "This field is required" : ""}
          required={isMandatory}
          size="small"
        />
      );
    }

    if(c.internal_type === 'boolean') {
      return (
        <EnhancedCheckBox
          c={c}
          formData={formData}
          setFormData={setFormData}
        />
      );
    }

    return (
      <TextField
        fullWidth
        id={`form-textfield-${c.sys_id}`}
        name={c.element}
        value={formData[c.element] || ""}
        error={error}
        required={isMandatory}
        helperText={error ? "This field is required" : ""}
        onChange={(e) => {
          handleInputChange(c.element, e.target.value);
          if (e.target.value) setError(false);
        }}
        size="small"
      />
    );
  };

  return (
    <Grid container alignItems="center">
      <Grid item xs={4} key={`grid-label-${c.sys_id}`}>
        <Typography>
          {c.column_label} | {c.element}
        </Typography>
      </Grid>
      <Grid item xs={6} key={`grid-field-${c.sys_id}`}>
        {renderField()}
      </Grid>
    </Grid>
  );
};

export default FormContents;
