import PropTypes from "prop-types"; // data type checking
import React, { useState, useEffect } from "react";
// import { Link as ReactRouterLink } from "react-router-dom";

// Styles
// import Link from "@mui/material/Link";
import ApiService from "../../services/ApiService";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";

const SimpleTableBody = (props) => {
  const {
    columns,
    // tableName,
    visibleRows,
    emptyRows,
    onRowClick,
  } = props;

  const [referenceDisplayNames, setReferenceDisplayNames] = useState({});
  const [referenceKey, setReferenceKey] = useState('sys_id'); // Default to sys_id


  useEffect(() => {
    const fetchReferenceNames = async () => {
      const newDisplayNames = {};
      for (const row of visibleRows) {
        for (const col of columns) {
          if (col.internal_type === "reference" && col.reference && row[col.element]) { // Check if it's a reference column and has a value
            const value = row[col.element];
            const ref_table = col.reference;
         try {   
            const keyResponse = await ApiService.getReferenceKey(col.sys_id);
          if (keyResponse.status === "success" && keyResponse.data)
            setReferenceKey(keyResponse.data);
          
        } catch (error) {
          console.error(`[ReferenceField] Error fetching reference key for column ${col.element}:`, error);
        }

            // Only fetch if not already fetched for this row and column
            if (!referenceDisplayNames[value] || !referenceDisplayNames[value][col.element]) {
              try {
                const response = await ApiService.getSysName(ref_table, value, col.reference_key || 'sys_id');
                if (response.status === "success" && response.data) {
                  if (!newDisplayNames[value]) newDisplayNames[value] = {};
                  newDisplayNames[value][col.element] = response.data;
                }
              } catch (error) {
                console.error(`[SimpleTableBody] Error fetching sys_name for table ${ref_table}, value ${value}:`, error);
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
        const labelId = `simple-table-row-${index}`;
        return (
          <TableRow
            hover
            tabIndex={-1}
            key={row.sys_id}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            <TableCell padding="checkbox" />
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
                      {onRowClick ? (
                        displayContent
                      ) : (
                        <span>{displayContent}</span>
                      )}
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
          <TableCell colSpan={columns.length} />
        </TableRow>
      )}
    </TableBody>
  );
};

SimpleTableBody.propTypes = {
  columns: PropTypes.array.isRequired,
  visibleRows: PropTypes.array.isRequired,
  emptyRows: PropTypes.number.isRequired,
  tableName: PropTypes.string.isRequired,
  onRowClick: PropTypes.func,
};

export default SimpleTableBody;
