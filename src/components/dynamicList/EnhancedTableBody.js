import PropTypes from "prop-types"; // data type checking
import React, { useState, useEffect } from "react";
import { Link as ReactRouterLink } from "react-router-dom";

// Styles
import Box from "@mui/material/Box";
import ApiService from "../../services/ApiService";
import Link from "@mui/material/Link";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
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
  const {
    columns,
    tableName,
    visibleRows,
    isSelected,
    handleClick,
    emptyRows,
  } = props;

  const [referenceDisplayNames, setReferenceDisplayNames] = useState({});

  useEffect(() => {
    const fetchReferenceNames = async () => {
      const newDisplayNames = {};
      for (const row of visibleRows) {
        for (const col of columns) {
          if (col.reference && row[col.element]) { // Check if it's a reference column and has a value
            const sysId = row[col.element];
            const tableName = col.reference;

            // Only fetch if not already fetched for this row and column
            if (!referenceDisplayNames[sysId] || !referenceDisplayNames[sysId][col.element]) {
              try {
                const response = await ApiService.getSysName(tableName, sysId);
                if (response.status === "success" && response.data) {
                  if (!newDisplayNames[sysId]) newDisplayNames[sysId] = {};
                  newDisplayNames[sysId][col.element] = response.data;
                } else {
                  console.warn(`Could not fetch sys_name for table ${tableName}, sys_id ${sysId}: ${response.err}`);
                }
              } catch (error) {
                console.error(`Error fetching sys_name for table ${tableName}, sys_id ${sysId}:`, error);
              }
            }
          }
        }
      }
      // Merge newDisplayNames with existing ones to avoid overwriting already fetched data
      setReferenceDisplayNames(prev => {
        const updated = { ...prev };
        for (const sysId in newDisplayNames) {
          updated[sysId] = { ...updated[sysId], ...newDisplayNames[sysId] };
        }
        return updated;
      });
    };

    fetchReferenceNames();
  }, [visibleRows, columns]); // Re-run when visibleRows or columns change

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
            // selected={isItemSelected}
            key={row.sys_id}
          >
            <TableCell padding="checkbox">
              <Tooltip title="Open record">
                <IconButton
                  sx={{ verticalAlign: "center" }}
                  component={ReactRouterLink}
                  to={`../${tableName}.form?sys_id=${row["sys_id"]}`}
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
                inputProps={{
                  "aria-labelledby": labelId,
                }}
              />
            </TableCell>
            {columns.map((c, i) => {
              const cellValue = row[c.element];
              let displayContent = cellValue;

              if (c.reference && cellValue) { // If it's a reference column and has a value
                if (referenceDisplayNames[cellValue] && referenceDisplayNames[cellValue][c.element]) {
                  displayContent = referenceDisplayNames[cellValue][c.element];
                }
              }

              return (
                <React.Fragment key={`${c.element}_${row.sys_id}`}>
                  {c.element !== "sys_id" ? (
                    <TableCell key={`${c.element}_${c.sys_id}`}>
                      {displayContent}
                    </TableCell>
                  ) : (
                    <TableCell
                      key={`${c.element}_${c.sys_id}`}
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      <Link
                        component={ReactRouterLink}
                        to={`../${tableName}.form?sys_id=${cellValue}`}
                      >
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
        <TableRow
          style={{height: 33 * emptyRows,}}>
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
