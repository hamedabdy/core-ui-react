import { TextField } from "@mui/material";

const MultilineTextField = ({ c, formData, handleInputChange, error, setError, isMandatory }) => {
  return (
    <TextField
      fullWidth
      id={`form-textarea-${c.sys_id}`}
      name={c.element}
      value={formData[c.element] || ""}
      error={error}
      required={isMandatory}
      helperText={error ? "This field is required" : ""}
      onChange={(e) => {
        handleInputChange(c.element, e.target.value);
        if (e.target.value) setError(false);
      }}
      multiline
      minRows={4}
      maxRows={15}
      size="small"
      sx={{
        width: 'calc(100% - 45px)',
        "& .MuiInputBase-root": {
        },
        "& .MuiInputBase-input": {
          fontSize: 13,
          lineHeight: 1.3,
        }
      }}
    />
  );
};

export default MultilineTextField;