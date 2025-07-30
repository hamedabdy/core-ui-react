import React, { useState } from "react";

import ApiService from "../../services/ApiService";
import OperatorSelect from "./OperatorSelect";

// Styles
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Box } from "@mui/material";

const QueryFilter = (props) => {
  const { tableName, setData } = props;

  const [showFilterQuery, setShowFilterQuery] = useState(false);
  const [conditions, setConditions] = useState([
    { field: "", operator: "", value: "", type: "AND" },
  ]);

  const filterListIconClick = () => {
    setShowFilterQuery(!showFilterQuery);
  };

  const addCondition = (type) => {
    const newCondition = { field: "", operator: "", value: "", type };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (index, key, value) => {
    const updatedConditions = [...conditions];
    updatedConditions[index][key] = value;
    setConditions(updatedConditions);
  };

  const handleRunFilter = async () => {
    const query = conditions
      .map((cond, index) => {
        const prefix = index === 0 ? "" : cond.type === "AND" ? "^" : "^OR";
        return `${prefix}${cond.field}${cond.operator}${cond.value}`;
      })
      .join("");

    try {
      const resp = await ApiService.getData({
        table_name: tableName,
        sysparm_query: query,
      });
      console.log("QUERYFILTER - Query result:", resp);
      setData(resp.data);
    } catch (error) {
      console.error("Error querying the server:", error);
    }
  };

  return (
    <Box sx={{ paddingLeft: 1, paddingBottom: 1, borderRadius: 0 }}>
      <Grid container>
        <Box>
          <Tooltip title="Filter list">
            <IconButton onClick={filterListIconClick}>
              <FilterAltOutlinedIcon color="primary" />
            </IconButton>
          </Tooltip>
          <a
            href="void(0)"
            onClick={(e) => {
              e.preventDefault();
              setConditions([]); // Clear all conditions
              handleRunFilter(); // Reload the list without any conditions
            }}
            style={{ textDecoration: "none", color: "blue", cursor: "pointer" }}
          >
            All{conditions.length > 0 ? " >" : ""}
          </a>
          {conditions.length > 0 &&
            conditions
              .map((cond, index) => {
                const prefix = index === 0 ? "" : " >"; // Ensure ' >' is added only after the first condition
                return `${prefix}${cond.field}${cond.operator}${cond.value}`;
              })
              .join("")}
        </Box>
      </Grid>
      <Grid container sx={{ display: showFilterQuery ? "grid" : "none" }}>
        <Box>
          <Button
            variant="outlined"
            sx={{ marginBottom: 1, marginRight: 1 }}
            onClick={handleRunFilter}
          >
            Run filter
          </Button>
          <Button variant="outlined" sx={{ marginBottom: 1 }}>
            New query
          </Button>
        </Box>
        <Box>
          {conditions.map((condition, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                marginBottom: 10,
                marginLeft: condition.type === "OR" ? 20 : 0, // Add left margin for OR conditions
              }}
            >
              <TextField
                label="Field"
                size="small"
                value={condition.field}
                onChange={(e) =>
                  updateCondition(index, "field", e.target.value)
                }
                sx={{ marginRight: 1 }}
              />
              <OperatorSelect
                value={condition.operator}
                onChange={(e) => updateCondition(index, "operator", e.target.value)}
                sx={{ marginRight: 1, minWidth: 120 }}
              />
              <TextField
                label="Value"
                size="small"
                value={condition.value}
                onChange={(e) =>
                  updateCondition(index, "value", e.target.value)
                }
                sx={{ marginRight: 1 }}
              />
              <Button
                variant="outlined"
                onClick={() => addCondition("OR")}
                sx={{ marginLeft: 1 }}
              >
                OR
              </Button>
              <Button
                variant="outlined"
                onClick={() => addCondition("AND")}
                sx={{ marginLeft: 1 }}
              >
                AND
              </Button>
              <Tooltip title="Remove condition">
                <IconButton
                  onClick={() =>
                    setConditions(conditions.filter((_, i) => i !== index))
                  }
                  sx={{ marginRight: 1, color: "red" }}
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Tooltip>
            </div>
          ))}
        </Box>
      </Grid>
    </Box>
  );
};

export default QueryFilter;
