# Using Link Opener on Documents You Don't Own

Since you don't own the Google Document, you can't install the add-on directly. Here are your options:

## Option 1: Standalone Google Apps Script (Console-based)

### Setup:
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the default `Code.gs` content with the code from this repository
4. Add the `LinkDialog.html` file to your project:
   - Click the "+" next to "Files"
   - Choose "HTML"
   - Name it "LinkDialog"
   - Replace the content with the HTML from this repository

### Usage Method A - Interactive Input:
1. Run the `processDocumentLinks()` function
2. Enter the document URL or ID in the popup dialog
3. Check the console output for the extracted links

### Usage Method B - Hardcoded Document:
1. Use `processSpecificDocument()` function
2. Replace `DOCUMENT_ID_HERE` with your actual document ID
3. Or use `processDocumentByUrl()` and replace `DOCUMENT_URL_HERE`

Example:
```javascript
function processMyDocument() {
  const doc = DocumentApp.openById('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  processDocument(doc);
}
```

## Option 2: Web App (Recommended - Full Interactive Experience)

### Setup:
1. Follow the same setup as Option 1
2. **Additionally**: Add the `WebApp.gs` file to your project
3. **Deploy as Web App**:
   - Click "Deploy" → "New Deployment"
   - Choose "Web app" as the type
   - Set execute permissions to "Anyone" or "Anyone with Google account"
   - Click "Deploy"
   - Copy the web app URL

### Usage:
1. Open the web app URL in your browser
2. Paste the Google Doc URL or ID
3. Click "Extract Links"
4. Use the interactive dialog to select and open links

### Advantages of Web App:
- Full interactive interface
- No need to check console logs
- Works from any browser
- Can be bookmarked for easy access

## Getting Document ID/URL:

### From URL:
- Full URL: `https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
- Document ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` (the part between `/d/` and `/edit`)

## Required Permissions:
The script will ask for permission to:
- Access your Google Docs
- Display content in a sidebar/dialog (for web app)

## Troubleshooting:

### "Cannot call DocumentApp.getUi() from this context"
- This is normal for standalone scripts
- Use the web app version for full UI functionality
- Or check the console output for extracted links

### "Permission denied" error
- Make sure you have edit access to the document
- The document owner needs to share it with edit permissions

### "Document not found" error
- Check that the URL/ID is correct
- Make sure the document exists and is accessible
- Remove any extra parameters from the URL

### No dialog appears in standalone script
- This is expected behavior
- Check the console output (View → Logs or Ctrl/Cmd+Enter)
- Use the web app version for interactive dialogs

## Important Notes:

- You need at least "Editor" access to the document
- The script can read but not modify the document structure  
- Links will open in new tabs/windows as usual
- Invalid URLs will be flagged but not filtered out automatically
- Web app version provides the best user experience