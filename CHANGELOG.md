# Changelog

## 2025-09-20
- Added a vertical 3 dots icon button beside the reference field, which on mouse hover, opens a vertical popover with other buttons (e.g., information button).
- Modified the "more actions" popover to open on mouse hover and close on mouse leave.
- **SimpleForm Component**: Corrected an issue where `columns.map` was not a function and fields were not displaying.
  - Ensured that the `columns` state is correctly set to an array by accessing `columnsResponse.data.data`, as the API response nests the actual column data.
  - Adjusted `formData` population to correctly handle API responses that might return a single object or an array containing the record.

### Added
- **ReferenceField Component**: Integrated `SimpleForm` to display reference record details in a popover.
  - Added an "information" icon button (`InfoOutlinedIcon`) next to the search icon.
  - When clicked, this button opens a `Popover` displaying a `SimpleForm` instance, which shows the fields and values of the referenced record (using `tableName` from `column.reference` and the current `value` as `sysId`).
  - The `tableName` is also shown in a tooltip at the top of the `SimpleForm`.
  - Ensured that the `sysId` prop passed to `SimpleForm` is always a string, extracting it from the `value` object if necessary.
- **SimpleForm Component**: Created a new `SimpleForm` component in `core-ui-react/src/components/simpleForm/SimpleForm.js`.
  - This component is inspired by `DynamicForm` but is simplified to only display fields and their values.
  - It takes `tableName` and `sysId` as input arguments.
  - It fetches table columns and record data using `ApiService.getColumns` and `ApiService.getData`.
  - The `tableName` is displayed in a tooltip at the top of the form.
- **SimpleTableBody Component**: Implemented `useEffect` hook to fetch and display `sys_name` for reference fields.
  - Utilized `ApiService.getSysName` to retrieve the `sys_name` for reference `sys_id`s in table rows.
  - Ensures that reference fields in the table body display their human-readable `sys_name` instead of the technical `sys_id`.
- **EnhancedTableBody Component**: Implemented `useEffect` hook to fetch and display `sys_name` for reference fields.
  - Utilized `ApiService.getSysName` to retrieve the `sys_name` for reference `sys_id`s in table rows.
  - Ensures that reference fields in the table body display their human-readable `sys_name` instead of the technical `sys_id`.
- **ReferenceField Component**: Implemented `useEffect` hook to fetch and display `sys_name` on page load.
  - Utilized the newly created `ApiService.getSysName` function to retrieve the `sys_name` based on the `sys_id` and `column.reference` properties.
  - Ensures that the display value of the reference field is correctly populated when the component mounts or when its `value` or `column.reference` props changes.
- **Sequelizer, tableApi, and ApiService**: Added functionality to retrieve `sys_name` by `sys_id`.
  - Created `getSysNameBySysId` function in `core-server/src/services/Sequelizer.js` to query the database for a given table name and `sys_id`, returning the `sys_name` value.
  - Created a new API endpoint `/sys_name/:table_name/:sys_id` in `core-server/src/routes/tableApi.js` to expose the `getSysNameBySysId` function.
  - Created a new `getSysName` function in `core-ui-react/src/services/ApiService.js` to allow the React frontend to call the new API endpoint and retrieve the `sys_name`.
- **ApiService**: Added `getReferenceKey` function to retrieve the display value for a reference key.
  - This function calls the new `/reference_key/:table_name/:sys_id` API endpoint.

## 2025-09-21
### Changed
- **ReferenceField Component**: Modified to dynamically determine the stored reference value.
  - Fetches `referenceKey` using `ApiService.getReferenceKey` based on the `column.reference` table.
  - Uses the fetched `referenceKey` (defaulting to `sys_id`) to store the appropriate value from the selected record in the `onChange` handler. This allows storing either `sys_id` or another specified attribute.

### Changed
- **Content Component**: Removed `maxWidth` property from the main `Box` component to ensure it covers 100% width of the page.

### Added
- **SimpleList Component**: A new component for displaying simplified table data.
- **SimpleListToolbar**: Toolbar for the SimpleList component.
- **SimpleListHead**: Table header for the SimpleList component.
- **SimpleTableBody**: Table body for the SimpleList component.

### Changed
- Replaced `EnhancedTableBody` with `SimpleTableBody` in `SimpleList.js` to simplify the table body and remove unnecessary complexity.
  - Improved handling of required attribute in form fields
  - Centralized mandatory field logic
  - Fixed browser's native form validation for optional fields
  - Ensured consistent behavior across all field types

### Added
- Added new SimpleTableBody component, a lightweight version of EnhancedTableBody for use in popups:
  - Created SimpleTableBody.js, removing the checkbox and info icon from rows
- Added new SimpleListHead component, a lightweight version of EnhancedTableHead for use in popups:
  - Created SimpleListHead.js with only column names and sorting functionality
  - Removed checkbox, search icon, and filtering for a simpler UI
- Added new ReferenceField component for handling reference type fields:
  - Created dedicated ReferenceField.js component
  - Added lookup dialog with DynamicList integration
  - Implemented search functionality with magnifying glass icon
  - Added proper data attributes for reference tracking
  - Enhanced form handling for reference values
  - Improved user experience with proper dialog sizing

### Added
- Enhanced Navigator component with dynamic menu loading:
  - Integrated with sys_app_application and sys_app_module tables using existing getData API
  - Added support for uncategorized modules in a separate section
  - Implemented filtering to show only active modules
  - Implemented automatic list view links for list_of_records type modules
  - Added proper navigation handling for menu items
  - Simplified UI by removing icons
  - Added loading and error states
  - Enhanced refresh functionality to reload menu data

### Changed
- **ReferenceField Component**: Corrected the value passed to the `onChange` handler.
  - Previously, the entire `referenceValue` object was passed, leading to database errors when saving.
  - Now, only the `sys_id` from the selected reference record is passed to the `onChange` handler, ensuring compatibility with database storage.
- **SimpleList and SimpleTableBody Components**: Implemented row click functionality for reference field selection.
  - `SimpleList.js` now accepts an `onRowClick` prop and passes it to `SimpleTableBody`.
  - `SimpleTableBody.js` now handles `onRowClick` events on table rows, returning the full row object.
  - Disabled navigation link for `sys_id` in `SimpleTableBody` when `onRowClick` is active, ensuring selection instead of navigation in dialogs.
- Updated SimpleList component to use SimpleListHead and SimpleListToolbar:
  - Replaced EnhancedTableHead with SimpleListHead for a lighter header
  - Replaced EnhancedToolbar with SimpleListToolbar for a simplified toolbar
- Enhanced delete functionality in DynamicForm component:
  - Added smart navigation after record deletion:
    - Returns to previous page if there's navigation history
    - Redirects to table list view if opened in new window without history
  - Improved error message handling with better error details
- Refactored the main application layout in `Paperbase.js` and `Header.js` to use a standard Material-UI pattern with a fixed header and persistent drawer. This resolves issues with content overflow, incorrect positioning, and excessive whitespace. The new layout is more robust and responsive.
