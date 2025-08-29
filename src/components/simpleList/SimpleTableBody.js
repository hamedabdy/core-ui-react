import PropTypes from "prop-types"; // data type checking
import React from "react";
import { Link as ReactRouterLink } from "react-router-dom";

// Styles
import Link from "@mui/material/Link";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";

const SimpleTableBody = (props) => {
  const {
    columns,
    tableName,
    visibleRows,
    emptyRows,
  } = props;

  return (
    <TableBody>
      {visibleRows.map((row, index) => {
        const labelId = `simple-table-row-${index}`;
        return (
          <TableRow
            hover
            tabIndex={-1}
            key={row.sys_id}
          >
            <tableCell padding="checkbox" />
            {columns.map((c, i) => (
              <React.Fragment key={`${c.element}_${row.sys_id}`}>
                {c.element !== "sys_id" ? (
                  <TableCell key={`${c.element}_${c.sys_id}`}>
                    {row[c.element]}
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
                      to={`../${tableName}.form?sys_id=${row[c.element]}`}
                    >
                      {row[c.element]}
                    </Link>
                  </TableCell>
                )}
              </React.Fragment>
            ))}
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
};

export default SimpleTableBody;
