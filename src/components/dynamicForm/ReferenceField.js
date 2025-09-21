import { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Typography,
  Popover,
  DialogContent,
  Dialog,
  InputAdornment,
  IconButton,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SimpleList from '../simpleList/SimpleList';
import SimpleForm from '../simpleForm/SimpleForm'; // Import SimpleForm
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
  const [displayValue, setDisplayValue] = useState(value);
  const [infoPopoverAnchorEl, setInfoPopoverAnchorEl] = useState(null); // State for info popover anchor
  const [moreActionsAnchorEl, setMoreActionsAnchorEl] = useState(null); // State for more actions popover anchor
  const [referenceKey, setReferenceKey] = useState('sys_id'); // Default to sys_id

  useEffect(() => {
    const fetchReferenceKeyAndSysName = async () => {
      if (column.reference) {
        try {
          const keyResponse = await ApiService.getReferenceKey(column.sys_id);
          console.log("[ReferenceField] Fetched reference key:", column.element, " -- ", column.sys_id, "->", keyResponse);
          
          if (keyResponse.status === "success" && keyResponse.data)
            setReferenceKey(keyResponse.data);
          
        } catch (error) {
          console.error(`[ReferenceField] Error fetching reference key for column ${column.element}:`, error);
        }

        if (value) {
          try {
            const response = await ApiService.getSysName(column.reference, value, referenceKey);
            if (response.status === "success" && response.data)
              setDisplayValue(response.data);
          } catch (error) {
            console.error(`[ReferenceField] Error fetching sys_name for table ${column.reference}, value ${value}:`, error);
          }
        }
      }

    };

    fetchReferenceKeyAndSysName();
  }, [value, column.reference]); // Re-run when value or reference table changes
  
  // Handle opening and closing of the record selector dialog
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSelect = (selectedItem) => {
    const selectedValue = selectedItem[referenceKey] || selectedItem.sys_id;

    // Create a reference value object containing both display and technical data
    const referenceValue = {
      display: selectedItem.sys_name,
      value: selectedValue,
      table: column.reference,
      reference: `${column.name}.${column.element}`
    };

    // Update the field value with the determined value (sys_id or other attribute)
    onChange({
      target: {
        name,
        value: referenceValue.value
      }
    });

    // Update the display value
    setDisplayValue(referenceValue.display);
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          'data-sys-id': value?.value || '',
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

      <Box
        sx={{ display: 'inline-flex' }}
      >
        <IconButton
          aria-describedby={'more-actions-popover'}
          size="small"
          disabled={disabled}
          aria-label="more actions"
          sx={{ ml: 1 }} // Add some margin to separate from TextField
          onClick={(e) =>
            setMoreActionsAnchorEl(moreActionsAnchorEl ? null : e.currentTarget)
          }
        >
          <MoreVertIcon />
        </IconButton>
        <Popover
          id={'more-actions-popover'}
          open={Boolean(moreActionsAnchorEl)}
          anchorEl={moreActionsAnchorEl}
          onClose={() => setMoreActionsAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ p: 1, display: 'flex', flexDirection: 'column' }}>
            {value && column.reference && (
              <IconButton
                aria-describedby='info-popover'
                onClick={(e) => {setInfoPopoverAnchorEl(e.currentTarget)}}
                size="small"
                aria-label="show reference info"
              >
                <InfoOutlinedIcon />
              </IconButton>
            )}
            {/* Add other buttons here if needed */}
          </Box>
        </Popover>
      </Box>

      <Popover
        id='info-popover'
        open={Boolean(infoPopoverAnchorEl)}
        anchorEl={infoPopoverAnchorEl}
        onClose={() => setInfoPopoverAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 0, maxWidth: 650 }}>
          {value && column.reference ? (
            <SimpleForm tableName={column.reference} sysId={typeof value === 'object' ? value.value : value} />
          ) : (
            <Typography>No reference record selected.</Typography>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default ReferenceField;
