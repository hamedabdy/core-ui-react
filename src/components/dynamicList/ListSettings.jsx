import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {Box, Paper, Grid, ListItemText, ListItem, List, Button, DialogActions, DialogContent, DialogTitle, Dialog, CircularProgress} from "@mui/material";
import PropTypes from "prop-types";

import ArrowLeftIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowRightIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowUpIcon from '@mui/icons-material/ExpandLess';
import ArrowDownIcon from '@mui/icons-material/ExpandMore';

import { loadListColumnPref, saveListColumnPref } from "../../services/userPreferenceService";

const ListSettings = ({
  open,
  onClose,
  onOk,
  columns,
  selectedColumns: initialSelectedColumns,
  tableName
}) => {
  const [searchParams] = useSearchParams();
  // Use columns prop for available columns
  const [leftList, setLeftList] = useState([]);
  const [rightList, setRightList] = useState([]);
  const [leftSelected, setLeftSelected] = useState([]);
  const [rightSelected, setRightSelected] = useState([]);
  const [prefRecord, setPrefRecord] = useState(null);
  const [prefLoading, setPrefLoading] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const applyColumns = (selectedCols, allElements) => {
    const valid = selectedCols.filter(el => allElements.includes(el));
    const resolved = valid.length ? valid : allElements;
    setRightList(resolved);
    setLeftList(allElements.filter(el => !resolved.includes(el)));
    setLeftSelected([]);
    setRightSelected([]);
  };

  useEffect(() => {
  if (!open || !columns?.length) return;

  const allElements = columns.map(col => col.element);
  // initialSelectedColumns already reflects the preference (set by DynamicList)
  setRightList([...initialSelectedColumns]);
  setLeftList(allElements.filter(el => !initialSelectedColumns.includes(el)));
  setLeftSelected([]);
  setRightSelected([]);
}, [open, columns, initialSelectedColumns]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers (all unchanged) ───────────────────────────────────────────────
  const handleAdd = () => {
    const newItems = leftList.filter(item => leftSelected.includes(item));
    setRightList([...rightList, ...newItems]);
    setLeftList(leftList.filter(item => !leftSelected.includes(item)));
    setLeftSelected([]);
  };

  const handleRemove = () => {
    const newItems = rightList.filter(item => rightSelected.includes(item));
    setLeftList([...leftList, ...newItems]);
    setRightList(rightList.filter(item => !rightSelected.includes(item)));
    setRightSelected([]);
  };

  const handleMoveUp = () => {
    if (rightSelected.length !== 1) return;
    const idx = rightList.indexOf(rightSelected[0]);
    if (idx > 0) {
      const newList = [...rightList];
      [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
      setRightList(newList);
      setRightSelected([newList[idx - 1]]);
    }
  };

  const handleMoveDown = () => {
    if (rightSelected.length !== 1) return;
    const idx = rightList.indexOf(rightSelected[0]);
    if (idx < rightList.length - 1 && idx !== -1) {
      const newList = [...rightList];
      [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
      setRightList(newList);
      setRightSelected([newList[idx + 1]]);
    }
  };
  
  // ── Save preference then notify parent ────────────────────────────────────
  const handleOk = async () => {
    onOk(rightList); // ← always notify parent
  };

  // Helper to get label from element
  const getLabel = (element) => {
    const col = columns.find(c => c.element === element);
    return col ? col.column_label : element;
  };

  // ── Render (unchanged except loading guard + OK disabled) ─────────────────
  return (
    <Dialog open={open} onClose={onClose} fullWidth PaperProps={{ sx: { minHeight: 500, minWidth: 400, maxHeight: 700, maxWidth: 600 } }}>
      <DialogTitle>Select Columns</DialogTitle>
      <DialogContent>
        {prefLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
            <CircularProgress size={36} />
          </Box>
        ) : (
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item xs={5}>
              <Paper variant="outlined" sx={{ height: 350, overflow: 'auto' }}>
                <List dense>
                  {leftList.map((element) => (
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
            <Grid item xs={2} container direction="column" alignItems="center" justifyContent="center" style={{ minHeight: 300, maxWidth: 50 }}>
              <Button variant="outlined" onClick={handleAdd} disabled={leftSelected.length === 0} sx={{ mb: 1, borderRadius: 0.5, minWidth: 36, minHeight: 36, p: 0 }}>
                <ArrowRightIcon fontSize="medium" />
              </Button>
              <Button variant="outlined" onClick={handleRemove} disabled={rightSelected.length === 0} sx={{ borderRadius: 0.5, minWidth: 36, minHeight: 36, p: 0 }}>
                <ArrowLeftIcon fontSize="medium" />
              </Button>
            </Grid>
            <Grid item xs={5} container direction="row" alignItems="center" justifyContent="flex-start" wrap="nowrap">
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
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleOk} variant="contained" disabled={prefLoading}>OK</Button> {/* ← disabled during load */}
      </DialogActions>
    </Dialog>
  );
};

ListSettings.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  selectedColumns: PropTypes.array.isRequired,
};

export default ListSettings;
