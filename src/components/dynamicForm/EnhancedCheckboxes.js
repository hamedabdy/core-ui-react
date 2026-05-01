import React from "react";
import { FormControlLabel, Checkbox } from "@mui/material";

const handleCheckboxClick = (event, setFormData) => {
  const { name, checked } = event.target;
  // Update the formData
  setFormData((prev) => ({
    ...prev,
    [name]: checked,
  }));
};

const EnhancedCheckBox = ({
  c,
  formData,
  setFormData,
}) => {
  return (
    <FormControlLabel
      required={c.mandatory}
      control={
        <Checkbox
          name={c.element}
          checked={Boolean(formData[c.element])}
          size="medium"
          onChange={(event) =>
            handleCheckboxClick(event, setFormData)
          }
          key={`checkbox-${c.sys_id}`}
        />
      }
    />
  );
};

export default EnhancedCheckBox;
