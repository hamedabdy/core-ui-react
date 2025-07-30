import React from "react";
import { Grid, Typography, FormControl, TextField } from "@mui/material";

const FormContents = ({ c, formData, handleInputChange, error, setError }) => {
  return (
    <Grid container alignItems="center">
      <Grid item xs={4} key={`grid-label-${c.sys_id}`}>
        <Typography>
          {c.column_label} | {c.element}
        </Typography>
      </Grid>
      <Grid item xs={6} key={`grid-field-${c.sys_id}`}>
        <FormControl fullWidth variant="outlined">
          <TextField
            fullWidth
            id={`form-textfield-${c.sys_id}`}
            name={c.element}
            // variant={isSysColumn(c.element) ? "filled" : FormControl.variant}
            // inputProps={{ readOnly: isSysColumn(c.element),}}
            value={formData[c.element] || ""}
            error={error}
            required={false}
            helperText={error ? "This field is required" : ""}
            onChange={(e) => {
              handleInputChange(c.element, e.target.value);
              if (e.target.value) setError(false);
            }}
            size="small"
          />
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default FormContents;
