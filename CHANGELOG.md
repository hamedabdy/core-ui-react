# Changelog

All notable changes to the core-ui-react project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Enhanced delete functionality in DynamicForm component:
  - Added smart navigation after record deletion:
    - Returns to previous page if there's navigation history
    - Redirects to table list view if opened in new window without history
  - Improved error message handling with better error details
  - Improved error message display with dynamic styling based on message type
