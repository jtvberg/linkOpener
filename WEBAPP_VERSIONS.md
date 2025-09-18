# Web App Versions

This project contains several versions of the Google Apps Script web app, each designed for different purposes and representing the evolution of the solution:

## WebApp_Auth.gs (RECOMMENDED)
**Purpose**: The latest and most robust version with explicit authorization handling.

**Key Features**:
- Explicit authorization checking in `doGet()` function
- Dedicated authorization page with clear instructions
- Proper error handling for permission issues
- Single-page design avoiding redirect problems
- Comprehensive OAuth scope management via `appsscript.json`

**Use Case**: Deploy this version for public use where multiple users need to access documents they don't own.

**Deployment Settings**:
- Execute as: "User accessing the web app"
- Who has access: "Anyone"

## WebApp_Simple.gs
**Purpose**: Clean single-page implementation without explicit auth handling.

**Key Features**:
- Simple, streamlined interface
- Self-contained HTML with inline JavaScript
- Good for testing and development
- May have authorization loop issues in multi-user scenarios

**Use Case**: Good for personal use or when script owner is the primary user.

## WebApp_Debug.gs
**Purpose**: Debugging version with extensive logging and error reporting.

**Key Features**:
- Detailed console logging
- Extended error messages
- User information display
- Useful for troubleshooting permission issues

**Use Case**: Use this version when debugging deployment or permission problems.

## WebApp.gs
**Purpose**: Original redirect-based implementation.

**Key Features**:
- Uses URL parameters and redirects
- Separate pages for different states
- More complex but flexible architecture

**Use Case**: Historical reference; not recommended for new deployments due to redirect issues.

## Code.gs
**Purpose**: Original document-bound script for menu integration.

**Key Features**:
- Works within Google Docs as an add-on
- Popup dialog interface
- Menu integration with `onOpen()` trigger
- Requires document ownership to install

**Use Case**: Use when you want to add link extraction as a menu option within Google Docs you own.

## Deployment Instructions

### For Public Web App (Recommended):
1. Use `WebApp_Auth.gs`
2. Deploy as web app with:
   - Execute as: "User accessing the web app"
   - Who has access: "Anyone"
3. The `appsscript.json` manifest includes proper OAuth scopes

### For Document-bound Script:
1. Use `Code.gs` and `LinkDialog.html`
2. Install as document-bound script in the Google Doc
3. Use the Extensions menu to access the tool

## Troubleshooting

### Authorization Loops
If users get stuck in repeated authorization prompts:
- Ensure you're using `WebApp_Auth.gs`
- Verify deployment settings use "User accessing"
- Check that `appsscript.json` has the correct OAuth scopes

### Permission Denied Errors
- Verify the user has at least view access to the document
- Ensure the web app is deployed with "User accessing" execution
- Check that the document URL/ID is correct

### Blank Pages or Redirect Issues
- Use `WebApp_Auth.gs` or `WebApp_Simple.gs` (single-page designs)
- Avoid `WebApp.gs` which has known redirect issues