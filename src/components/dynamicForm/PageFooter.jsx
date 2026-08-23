// Styles
import Box from "@mui/material/Box";

// IMPORT LOCAL COMPONENTS
import FormButtons from "./FormButtons";

const PageFooter = (props) => {
  const { insertAndStay, handleDelete } = props;

  return (
    <Box
      sx={{
        mt: 0.5,
        mb: 5,
        width: '100%',
      }}
      key={"box-buttons-bottom"}
    >
      <FormButtons insertAndStay={insertAndStay} handleDelete={handleDelete} />
    </Box>
  );
};

export default PageFooter;
