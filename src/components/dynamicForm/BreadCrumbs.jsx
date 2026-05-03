// Styles
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Breadcrumbs from "@mui/material/Breadcrumbs";

const BreadCrumbs = (props) => {
  const { tableName } = props;
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link color="inherit" href="/nav">
        Home
      </Link>
      <Link
        color="inherit"
        sx={{
          textTransform: "capitalize",
        }}
        href={`./${tableName}.list`}
      >
        {tableName}s
      </Link>
      <Typography
        sx={{
          fontWeight: "bold",
        }}
        color="textPrimary"
      >
        Current page
      </Typography>
    </Breadcrumbs>
  );
};

export default BreadCrumbs;
