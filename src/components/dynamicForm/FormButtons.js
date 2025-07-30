// import React, {
//   useState,
//   useEffect,
//   useRef,
//   startTransition,
//   Suspense,
// } from "react";
// import { useParams, useSearchParams, useNavigate } from "react-router-dom";

// import ApiService from "../../services/ApiService";

// Styles
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

// Form top and bottom buttons
const FormButtons = (props) => {
  //   const navigate = useNavigate();
  //   const { tableName, formData, setFormData, setReloadData, sysID, setSysID } = props;
  const { insertAndStay, handleDelete } = props;

  //   const insertAndStay = async (event) => {
  //     event.preventDefault();
  //     var fd = formData;
  //     fd.sys_id = "-1";
  //     fd.sys_created_on =
  //       fd.sys_created_by =
  //       fd.sys_updated_on =
  //       fd.sys_updated_by =
  //       fd.sys_name =
  //         "";

  //     setFormData(fd);

  //     try {
  //       // Send a request to your API to insert a new row
  //       const response = await ApiService.addData(tableName, formData);
  //       if (response.status === "success") {
  //         setSysID(response.sys_id);
  //         navigate(`?sys_id=${response.sys_id}`);
  //         // After saving the form, update the state to trigger a re-render
  //         setReloadData(true);
  //       }
  //     } catch (error) {
  //       console.error("Error inserting row:", error);
  //     }
  //   };

  //   const handleDelete = async (event) => {
  //     event.preventDefault();
  //     try {
  //       const response = await ApiService.deleteData(tableName, sysID);
  //       if (response.status === "success") {
  //         navigate(-1);
  //         // After saving the form, update the state to trigger a re-render
  //         setReloadData(true);
  //       }
  //     } catch (error) {
  //       console.error("Error deleting row:", error);
  //     }
  //   };

  return (
    <Stack direction="row" spacing={2}>
      <Button type="submit" variant="contained" disableElevation size="small">
        Save
      </Button>
      <Button
        type="button"
        variant="contained"
        // color="secondary"
        disableElevation
        size="small"
        onClick={insertAndStay}
      >
        Insert and stay
      </Button>
      <Button
        type="button"
        variant="contained"
        color="error"
        disableElevation
        size="small"
        onClick={handleDelete}
      >
        Delete
      </Button>
    </Stack>
  );
};

export default FormButtons;
