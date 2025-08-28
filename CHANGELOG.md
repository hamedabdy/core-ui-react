# Changelog

All notable changes to the core-ui-react project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
