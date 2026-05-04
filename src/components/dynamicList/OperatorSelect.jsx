import React from "react";
import PropTypes from "prop-types";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

const operatorOptions = [
  { label: "is", value: "=" },
  { label: "is not", value: "!=" },
  { label: "is one of", value: "IN" },
  { label: "contains", value: "*" },
  { label: "starts with", value: "STARTSWITH" },
  { label: "ends with", value: "%" },
  { label: "is empty", value: "ISEMPTY" },
  { label: "is not empty", value: "ISNOTEMPTY" },
  { label: "is dynamic", value: "ISDYNAMIC" },
  { label: "is greater than", value: ">" },
  { label: "is lower than", value: "<" },
  { label: "is greater equal", value: ">=" },
  { label: "is lower equal", value: "<=" },
  { label: "is anything", value: "ANYTHING" },
  { label: "is same", value: "" },
  { label: "is different", value: "" },
  { label: "between", value: "between" },
];

const OperatorSelect = ({ value, onChange, sx }) => (
  <FormControl size="small" sx={sx}>
    <InputLabel id="operator-select-label">Operator</InputLabel>
    <Select
      labelId="operator-select-label"
      id="operator-select"
      value={value}
      label="Operator"
      onChange={onChange}
    >
      {operatorOptions.map((option) => (
        <MenuItem key={option.label} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

OperatorSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default OperatorSelect;
