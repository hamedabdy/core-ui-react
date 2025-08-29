import { Grid, Typography, FormControl, TextField } from "@mui/material";
import ReferenceField from './ReferenceField';

const FormContents = ({ c, formData, handleInputChange, error, setError }) => {
  // console.log("FormContents - Rendering field - Mandatory : %s - element : %s", c.mandatory, c.element);
  
  // Ensure c.mandatory is properly handled
  const isMandatory = c.mandatory === false;
  const renderField = () => {
    if (c.internal_type === 'reference') {
      return (
        <ReferenceField
          name={c.element}
          label={c.column_label}
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
        <FormControl fullWidth variant="outlined">
          {renderField()}
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default FormContents;
