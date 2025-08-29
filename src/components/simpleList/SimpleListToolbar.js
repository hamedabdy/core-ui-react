import PropTypes from "prop-types";
import { AppBar, Toolbar, Typography } from "@mui/material";

const SimpleListToolbar = (props) => {
  const { table } = props;

  return (
    <AppBar
      elevation={1}
      color="default"
      sx={{ position: "relative", zIndex: 100, padding: 1, backgroundColor: "#ddddddc7" }}
    >
      <Toolbar>
        <Typography
          sx={{
            flex: "1 1 100%",
            fontWeight: "bold",
            textTransform: "capitalize",
          }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {table.label}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

SimpleListToolbar.propTypes = {
  table: PropTypes.object,
};

export default SimpleListToolbar;
