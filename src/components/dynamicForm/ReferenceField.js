import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Dialog from '@mui/material/Dialog';
// import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// import DynamicList from '../DynamicList';
import { styled } from '@mui/material/styles';
import SimpleList from '../SimpleList';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    minWidth: '60%',
    maxHeight: '80vh'
  }
}));

const ReferenceField = ({
  name,
  label,
  value,
  onChange,
  column,
  error,
  helperText,
  required,
  disabled,
  fullWidth = true,
  size = 'small',
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(value?.display || '');
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // console.log("ReferenceField - Rendering reference field for column: %o", column);
  

  const handleSelect = (selectedItem) => {
    // Create a reference value object containing both display and technical data
    const referenceValue = {
      display: selectedItem.sys_name || selectedItem.name,
      sys_id: selectedItem.sys_id,
      table: column.reference,
      reference: `${column.name}.${column.element}`
    };

    // Update the field value with only the sys_id
    onChange({
      target: {
        name,
        value: referenceValue.sys_id
      }
    });

    // Update the display value
    setDisplayValue(referenceValue.display);
    handleClose();
  };

  return (
    <>
      <TextField
        name={name}
        value={displayValue}
        onChange={(e) => setDisplayValue(e.target.value)}
        error={error}
        helperText={helperText}
        required={required === true}
        disabled={disabled}
        fullWidth={fullWidth}
        size={size}
        type="search"
        inputProps={{
          'data-type': 'reference_input',
          'data-table': column.reference,
          'data-ref': `${column.name}.${column.element}`,
          'data-sys-id': value?.sys_id || '',
          autoComplete: 'off',
          autoCorrect: 'off',
          spellCheck: 'false'
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton 
                onClick={handleOpen}
                edge="end"
                size="small"
                disabled={disabled}
                aria-label="look up reference"
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        {...props}
      />
      
      <StyledDialog 
        open={open} 
        onClose={handleClose}
        aria-labelledby="reference-dialog-title"
      >
        <DialogContent>
          <SimpleList 
            tableName={column.reference}
            onRowClick={handleSelect}
            hideToolbar={false}
          />
        </DialogContent>
      </StyledDialog>
    </>
  );
};

export default ReferenceField;
