// components/TableList.js
import { useState, useEffect } from "react";
import ApiService from "../services/ApiService";
import {
  List,
  ListItemText,
  ListSubheader,
  ListItemButton,
} from "@mui/material";

const TableList = ({ onTableSelect }) => {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await ApiService.getTables();
        setTables(data);
      } catch (error) {
        // Handle error
      }
    };
    fetchTables();
  }, []);

  const handleItemClick = (tableName) => {
    const newUrl = `./${tableName}.list`;
    onTableSelect(newUrl);
    window.history.pushState(null, "", newUrl);
  };

  return (
    <List
      sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          Nested List Items
        </ListSubheader>
      }
    >
      {tables.map((o) => (
        <ListItemButton
          key={o.tableName}
          onClick={() => handleItemClick(o.tableName)}
        >
          <ListItemText primary={o.tableName} />
        </ListItemButton>
      ))}
    </List>
  );
};

export default TableList;
