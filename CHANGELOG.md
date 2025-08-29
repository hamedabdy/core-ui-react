# Changelog

All notable changes to the core-ui-react project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Fixed form submission issue with non-mandatory fields:
  - Added strict equality check for mandatory field validation
  - Improved handling of required attribute in form fields
  - Centralized mandatory field logic
  - Fixed browser's native form validation for optional fields
  - Ensured consistent behavior across all field types

### Added
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
- Enhanced delete functionality in DynamicForm component:
  - Added smart navigation after record deletion:
    - Returns to previous page if there's navigation history
    - Redirects to table list view if opened in new window without history
  - Improved error message handling with better error details
  - Improved error message display with dynamic styling based on message type
