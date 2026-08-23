import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import { Box, Link, TableRow, TableCell, TableBody, Checkbox, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

import ApiService from "../../services/ApiService";

// Kept your Pagination component here as it was in your file
function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => onPageChange(event, 0);
  const handleBackButtonClick = (event) => onPageChange(event, page - 1);
  const handleNextButtonClick = (event) => onPageChange(event, page + 1);
  const handleLastPageButtonClick = (event) => onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="next page">
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="last page">
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const EnhancedTableBody = (props) => {
  const { columns, tableName, visibleRows, isSelected, handleClick, emptyRows } = props;
  const navigate = useNavigate(); // <--- Added for row-click navigation

  const [referenceDisplayNames, setReferenceDisplayNames] = useState({});

  useEffect(() => {
    const fetchReferenceNames = async () => {
      // 1. OPTIMIZATION: Filter reference columns first
      const refColumns = columns.filter(c => c.internal_type === "reference" && c.reference);
      if (refColumns.length === 0) return;

      const newDisplayNames = {};
      
      // 2. OPTIMIZATION: Fetch reference keys ONCE per column (not per row!)
      const columnKeyMap = {};
      for (const col of refColumns) {
        try {
          const keyResponse = await ApiService.getReferenceKey(col.sys_id);
          if (keyResponse.status === "success" && keyResponse.data) {
            columnKeyMap[col.element] = keyResponse.data;
          }
        } catch (error) {
          console.error(`Error fetching reference key for column ${col.element}:`, error);
        }
      }

      // 3. Fetch display values for rows
      for (const row of visibleRows) {
        for (const col of refColumns) {
          const value = row[col.element];
          if (value) {
            try {
              const refKey = col.reference_key || columnKeyMap[col.element] || 'sys_id';
              const response = await ApiService.getDisplayValue(col.reference, value, refKey);
              
              if (response.status === "success" && response.data) {
                if (!newDisplayNames[value]) newDisplayNames[value] = {};
                newDisplayNames[value][col.element] = response.data;
              }
            } catch (error) {
              console.error(`Error fetching display value for table ${col.reference}, value ${value}:`, error);
            }
          }
        }
      }

      // 4. Merge safely without overwriting
      setReferenceDisplayNames(prev => {
        const updated = { ...prev };
        for (const sysId in newDisplayNames) {
          updated[sysId] = { ...updated[sysId], ...newDisplayNames[sysId] };
        }
        return updated;
      });
    };

    fetchReferenceNames();
  }, [visibleRows, columns]);

  // Handler for clicking anywhere on the row
  const handleRowClick = (event, sysId) => {
    // Prevent navigation if the user clicked the checkbox or the info icon
    if (event.target.closest('button, a, input')) return;
    navigate(`../${tableName}.form?sys_id=${sysId}`);
  };

  return (
    <TableBody>
      {visibleRows.map((row, index) => {
        const isItemSelected = isSelected(row.sys_id);
        const labelId = `enhanced-table-checkbox-${index}`;
        
        return (
          <TableRow
            hover
            aria-checked={isItemSelected}
            tabIndex={-1}
            key={row.sys_id}
            onClick={(event) => handleRowClick(event, row.sys_id)} // <--- Added row click
            sx={{ cursor: 'pointer' }} // <--- Visual feedback that row is clickable
          >
            <TableCell padding="checkbox">
              <Tooltip title="Open record">
                <IconButton
                  sx={{ verticalAlign: "center" }}
                  component={ReactRouterLink}
                  to={`../${tableName}.form?sys_id=${row.sys_id}`}
                >
                  <InfoOutlinedIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
            <TableCell padding="checkbox">
              <Checkbox
                onClick={(event) => handleClick(event, row.sys_id)}
                color="primary"
                checked={isItemSelected}
                inputProps={{ "aria-labelledby": labelId }}
              />
            </TableCell>
            
            {columns.map((c) => {
              const cellValue = row[c.element];
              let displayContent = cellValue !== null && cellValue !== undefined ? String(cellValue) : '';

              if (c.reference && cellValue && referenceDisplayNames[cellValue]?.[c.element]) {
                displayContent = referenceDisplayNames[cellValue][c.element];
              }

              return (
                <React.Fragment key={`${c.element}_${row.sys_id}`}>
                  {c.element !== "sys_id" ? (
                    <TableCell>{displayContent}</TableCell>
                  ) : (
                    <TableCell component="th" id={labelId} scope="row" padding="none">
                      <Link component={ReactRouterLink} to={`../${tableName}.form?sys_id=${cellValue}`}>
                        {cellValue}
                      </Link>
                    </TableCell>
                  )}
                </React.Fragment>
              );
            })}
          </TableRow>
        );
      })}
      
      {emptyRows > 0 && (
        <TableRow key="empty-rows" style={{ height: 33 * emptyRows }}>
          <TableCell colSpan={6} />
        </TableRow>
      )}
    </TableBody>
  );
};

EnhancedTableBody.propTypes = {
  columns: PropTypes.array.isRequired,
  visibleRows: PropTypes.array.isRequired,
  isSelected: PropTypes.func.isRequired,
  handleClick: PropTypes.func.isRequired,
  emptyRows: PropTypes.number.isRequired,
  tableName: PropTypes.string.isRequired,
};

export default EnhancedTableBody;