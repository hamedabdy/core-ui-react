import React from "react";
import { Grid, Typography, FormControlLabel, Checkbox } from "@mui/material";

const handleCheckboxClick = (event, setCheckboxes, setFormData) => {
  const { name, checked } = event.target;
  // Update the checkboxes state
  setCheckboxes((prev) => ({ ...prev, [name]: checked }));
  // Update the formData
  setFormData((prev) => ({
    ...prev,
    [name]: checked,
  }));
};

const EnhancedCheckBox = ({
  c,
  checkboxes,
  formData,
  setCheckboxes,
  setFormData,
}) => {
  return (
    <Grid container alignItems="center">
      <Grid item xs={4} key={`grid-checkbox-label-${c.sys_id}`}>
        <Typography key={`checkbox-label-${c.element}`}>
          {c.column_label}
        </Typography>
      </Grid>
      <Grid item xs={8} key={`grid-checkbox-${c.sys_id}`}>
        <FormControlLabel
          required={c.mandatory === 1}
          control={
            <Checkbox
              name={c.element}
              checked={checkboxes[c.element] || formData[c.element] === 1}
              size="medium"
              onChange={(event) =>
                handleCheckboxClick(event, setCheckboxes, setFormData)
              }
              key={`checkbox-${c.sys_id}`}
            />
          }
        />
      </Grid>
    </Grid>
  );
};

export default EnhancedCheckBox;
