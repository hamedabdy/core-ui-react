import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { styled } from '@mui/material/styles';
import SimpleList from '../SimpleList';
import ApiService from '../../services/ApiService';

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

  useEffect(() => {
    const fetchSysName = async () => {
      if (value && column.reference) {
        try {
          const response = await ApiService.getSysName(column.reference, value);
          if (response.status === "success" && response.data) {
            setDisplayValue(response.data);
          } else {
            console.warn(`Could not fetch sys_name for table ${column.reference}, sys_id ${value}: ${response.err}`);
            setDisplayValue(''); // Clear display if not found or error
          }
        } catch (error) {
          console.error(`Error fetching sys_name for table ${column.reference}, sys_id ${value}:`, error);
          setDisplayValue(''); // Clear display on API error
        }
      } else {
        setDisplayValue(''); // Clear display if no value or reference
      }
    };

    fetchSysName();
  }, [value, column.reference]); // Re-run when value or reference table changes
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
