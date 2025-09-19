# Changelog

## [Unreleased]

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
