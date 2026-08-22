import React, { useState, useEffect } from "react";
import {
  Box, Paper, Grid, ListItemText, ListItem, List, Button,
  DialogActions, DialogContent, DialogTitle, Dialog,
  Select, MenuItem, FormControl, InputLabel, TextField, IconButton, Tooltip, Typography
} from "@mui/material";

import ArrowLeftIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowRightIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowUpIcon from '@mui/icons-material/ExpandLess';
import ArrowDownIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const FormLayoutConfig = ({
  open,
  onClose,
  onSave,
  columns,
  initialLayout,
  tableName
}) => {
  const [layout, setLayout] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [leftSelected, setLeftSelected] = useState([]);
  const [rightSelected, setRightSelected] = useState([]);

  // Initialize layout when modal opens
  useEffect(() => {
    if (open) {
      let parsedLayout = [];
      if (initialLayout && initialLayout.length > 0) {
        parsedLayout = initialLayout.map(sec => ({ ...sec, id: sec.id || Math.random().toString(36).substr(2, 9) }));
      } else {
        // Default General Section
        parsedLayout = [{
          id: "general",
          name: "General",
          type: 2, // 2-column by default
          fields: columns.map(c => c.element) // Default all fields to general
        }];
      }
      setLayout(parsedLayout);
      setActiveSectionId(parsedLayout[0].id);
      setLeftSelected([]);
      setRightSelected([]);
    }
  }, [open, columns, initialLayout]);

  // Derived state for lists
  const allElements = columns.map(col => col.element);
  const assignedFields = layout.flatMap(sec => sec.fields);
  const availableFields = allElements.filter(el => !assignedFields.includes(el));
  
  const activeSection = layout.find(sec => sec.id === activeSectionId) || {};
  const rightList = activeSection.fields || [];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAdd = () => {
    const newItems = availableFields.filter(item => leftSelected.includes(item));
    setLayout(prev => prev.map(sec => 
      sec.id === activeSectionId 
        ? { ...sec, fields: [...sec.fields, ...newItems] }
        : sec
    ));
    setLeftSelected([]);
  };

  const handleRemove = () => {
    const itemsToRemove = rightList.filter(item => rightSelected.includes(item));
    setLayout(prev => prev.map(sec => 
      sec.id === activeSectionId 
        ? { ...sec, fields: sec.fields.filter(f => !itemsToRemove.includes(f)) }
        : sec
    ));
    setRightSelected([]);
  };

  const handleMoveUp = () => {
    if (rightSelected.length !== 1) return;
    const idx = rightList.indexOf(rightSelected[0]);
    if (idx > 0) {
      const newList = [...rightList];
      [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
      setLayout(prev => prev.map(sec => sec.id === activeSectionId ? { ...sec, fields: newList } : sec));
      setRightSelected([newList[idx - 1]]);
    }
  };

  const handleMoveDown = () => {
    if (rightSelected.length !== 1) return;
    const idx = rightList.indexOf(rightSelected[0]);
    if (idx < rightList.length - 1 && idx !== -1) {
      const newList = [...rightList];
      [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
      setLayout(prev => prev.map(sec => sec.id === activeSectionId ? { ...sec, fields: newList } : sec));
      setRightSelected([newList[idx + 1]]);
    }
  };

  const handleAddSection = (type) => {
    const newSec = {
      id: Math.random().toString(36).substr(2, 9),
      name: `New Section ${layout.length + 1}`,
      type: type,
      fields: []
    };
    setLayout(prev => [...prev, newSec]);
    setActiveSectionId(newSec.id);
  };

  const handleDeleteSection = () => {
    if (activeSectionId === "general") return; // Cannot delete General
    setLayout(prev => prev.filter(sec => sec.id !== activeSectionId));
    setActiveSectionId("general");
  };

  const handleSectionNameChange = (e) => {
    const newName = e.target.value;
    setLayout(prev => prev.map(sec => sec.id === activeSectionId ? { ...sec, name: newName } : sec));
  };

  const handleSave = () => {
    // Clean up IDs before saving to DB
    const cleanLayout = layout.map(({ id, ...rest }) => rest);
    onSave(cleanLayout, "Default view");
    onClose();
  };

  // Helper to get label from element
  const getLabel = (element) => {
    const col = columns.find(c => c.element === element);
    return col ? col.column_label : element;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth PaperProps={{ sx: { minHeight: 600, minWidth: 700, maxHeight: 800 } }}>
      <DialogTitle>Configure Form Layout ({tableName})</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} alignItems="flex-start" justifyContent="center">
          
          {/* Left Pane: Available Fields */}
          <Grid item xs={5}>
            <Typography variant="subtitle2" gutterBottom>Available Fields</Typography>
            <Paper variant="outlined" sx={{ height: 400, overflow: 'auto' }}>
              <List dense>
                {availableFields.map((element) => (
                  <ListItem
                    key={element}
                    onClick={e => {
                      if (e.ctrlKey || e.metaKey) {
                        setLeftSelected(leftSelected.includes(element) ? leftSelected.filter(item => item !== element) : [...leftSelected, element]);
                      } else {
                        setLeftSelected(leftSelected.includes(element) ? [] : [element]);
                      }
                    }}
                    sx={{ cursor: 'pointer', backgroundColor: leftSelected.includes(element) ? 'action.selected' : 'inherit' }}
                  >
                    <ListItemText primary={`${getLabel(element)} | ${element}`} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Middle Pane: Arrows */}
          <Grid item xs={1} container direction="column" alignItems="center" justifyContent="center" style={{ minHeight: 400 }}>
            <Button variant="outlined" onClick={handleAdd} disabled={leftSelected.length === 0} sx={{ mb: 1, borderRadius: 0.5, minWidth: 36, minHeight: 36, p: 0 }}>
              <ArrowRightIcon fontSize="medium" />
            </Button>
            <Button variant="outlined" onClick={handleRemove} disabled={rightSelected.length === 0} sx={{ borderRadius: 0.5, minWidth: 36, minHeight: 36, p: 0 }}>
              <ArrowLeftIcon fontSize="medium" />
            </Button>
          </Grid>

          {/* Right Pane: Sections & Selected Fields */}
          <Grid item xs={6}>
            {/* Section Controls */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
                <InputLabel>Section</InputLabel>
                <Select
                  value={activeSectionId}
                  label="Section"
                  onChange={(e) => { setActiveSectionId(e.target.value); setRightSelected([]); }}
                >
                  {layout.map(sec => (
                    <MenuItem key={sec.id} value={sec.id}>{sec.name} ({sec.type}-col)</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Add 1-Column Section">
                <IconButton onClick={() => handleAddSection(1)} size="small" color="primary"><AddIcon /> 1</IconButton>
              </Tooltip>
              <Tooltip title="Add 2-Column Section">
                <IconButton onClick={() => handleAddSection(2)} size="small" color="primary"><AddIcon /> 2</IconButton>
              </Tooltip>
              <Tooltip title="Delete Section">
                <span>
                  <IconButton onClick={handleDeleteSection} size="small" color="error" disabled={activeSectionId === "general"}>
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
            
            <TextField 
              size="small" 
              fullWidth 
              value={activeSection?.name || ""} 
              onChange={handleSectionNameChange}
              disabled={activeSectionId === "general"} // General is invisible/standard
              sx={{ mb: 1, '& .MuiInputBase-input': { fontSize: 13, padding: '6px 10px' } }}
            />

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Paper variant="outlined" sx={{ height: 350, minWidth: 200, overflow: 'auto', flex: 1 }}>
                <List dense>
                  {rightList.map((element) => (
                    <ListItem
                      key={element}
                      onClick={e => {
                        if (e.ctrlKey || e.metaKey) {
                          setRightSelected(rightSelected.includes(element) ? rightSelected.filter(item => item !== element) : [...rightSelected, element]);
                        } else {
                          setRightSelected(rightSelected.includes(element) ? [] : [element]);
                        }
                      }}
                      sx={{ cursor: 'pointer', backgroundColor: rightSelected.includes(element) ? 'action.selected' : 'inherit' }}
                    >
                      <ListItemText primary={`${getLabel(element)} | ${element}`} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
              <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1, height: 300, justifyContent: 'center' }}>
                <Button variant="outlined" sx={{ mb: 1, borderRadius: 0.5, minWidth: 36, minHeight: 36, p: 0 }} onClick={handleMoveUp} disabled={rightSelected.length !== 1 || rightList.indexOf(rightSelected[0]) === 0}>
                  <ArrowUpIcon fontSize="medium" />
                </Button>
                <Button variant="outlined" sx={{ borderRadius: 0.5, minWidth: 36, minHeight: 36, p: 0 }} onClick={handleMoveDown} disabled={rightSelected.length !== 1 || rightList.indexOf(rightSelected[0]) === rightList.length - 1}>
                  <ArrowDownIcon fontSize="medium" />
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormLayoutConfig;