// Styles
import Box from "@mui/material/Box";

// IMPORT LOCAL COMPONENTS
import FormButtons from "./FormButtons";

const PageFooter = (props) => {
  const { insertAndStay, handleDelete } = props;

  return (
    <Box sx={{ marginTop: "30px" }} key={"box-buttons-bottom"}>
      <FormButtons insertAndStay={insertAndStay} handleDelete={handleDelete} />
    </Box>
  );
};

export default PageFooter;
