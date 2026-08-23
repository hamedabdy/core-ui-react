import { Grid, Typography, TextField } from "@mui/material";
import ReferenceField from "./ReferenceField";
import EnhancedCheckBox from "./EnhancedCheckboxes";
import MultilineTextField from "./MultilineTextField";
import ScriptEditor from "./ScriptEditor";

const FormContents = ({ c, formData, setFormData, handleInputChange, error, setError }) => {
  if (!formData) return null;
  
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

    if (c.internal_type === 'boolean') {
      return (
        <EnhancedCheckBox
          c={c}
          formData={formData}
          setFormData={setFormData}
        />
      );
    }

    if (c.internal_type === "script") {
      return (
        <ScriptEditor
          c={c}
          formData={formData}
          handleInputChange={handleInputChange}
          error={error}
          setError={setError}
          isMandatory={isMandatory}
        />
      );
    }

    const maxLength = Number(c.max_length || 0);
    const useMultiline = maxLength > 255;

    if (useMultiline) {
      return (
        <MultilineTextField
          c={c}
          formData={formData}
          handleInputChange={handleInputChange}
          error={error}
          setError={setError}
          isMandatory={isMandatory}
        />
      );
    }

    return (
      <TextField
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
        sx={{ width: 'calc(100% - 45px)', '& .MuiInputBase-input': { fontSize: 13, padding: '6px 10px' } }}
      />
    );
  };

  // For script fields we want the label above the input to maximize editor space
  if (c.internal_type === "script") {
    return (
      <Grid container direction="column">
        <Grid item>
          <Typography sx={{ fontSize: 14, color: 'text.primary' }}>
            {c.column_label}
          </Typography>
        </Grid>
        <Grid item sx={{ mb: 1 }}>
          {renderField()}
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container alignItems="center" sx={{ mb: 0.3 }}>
      <Grid item xs={3} key={`grid-label-${c.sys_id}`}>
        <Typography sx={{ fontSize: 14, color: 'text.primary', textAlign: 'right', mr: 1 }}>
          {c.column_label}
        </Typography>
      </Grid>
      <Grid item xs={9} key={`grid-field-${c.sys_id}`}>
        {renderField()}
      </Grid>
    </Grid>
  );
};

export default FormContents;
