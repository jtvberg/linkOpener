# Google Docs Link Opener Bookmarklet

This bookmarklet provides a one-click way to open all links in a Google Document by calling your Google Apps Script web app.

## Why This Approach?

Google Docs uses a complex canvas-based rendering system that makes direct DOM extraction of document content nearly impossible with JavaScript. Instead, this bookmarklet calls your existing Google Apps Script web app (WebApp.gs) which uses Google's official Document API to properly extract links.

## Setup Instructions

### 1. Deploy Your Web App

First, make sure your Google Apps Script web app is deployed:

1. Open [Google Apps Script](https://script.google.com)
2. Create a new project or open your existing linkOpener project
3. Copy the code from `WebApp.gs` into your script
4. Go to **Deploy** > **New Deployment**
5. Choose **Web app** as the type
6. Set **Execute as**: "User accessing the web app"
7. Set **Who has access**: "Anyone" (or as restrictive as needed)
8. Click **Deploy**
9. Copy the web app URL (looks like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

### 2. Create the Bookmarklet

1. Copy the entire content from `bookmarklet-min.js` (the one-line JavaScript code)
2. In your browser, create a new bookmark:
   - **Chrome/Edge**: Ctrl+Shift+O → Add new bookmark
   - **Firefox**: Ctrl+Shift+B → Add bookmark
   - **Safari**: Bookmarks menu → Add Bookmark
3. Set the **Name** to: `Open Google Docs Links`
4. Set the **URL** to: `javascript:(paste the entire code from bookmarklet-min.js here)`
5. Save the bookmark

### 3. How to Use

1. Navigate to any Google Document in your browser
2. Click the "Open Google Docs Links" bookmark
3. On first use, you'll be prompted to enter your web app URL
4. The web app will open in a new window with the document URL pre-filled
5. Click "Extract Links" to find all hyperlinks in the document
6. Use the interface to open all links or select specific ones

## Features

- **One-click activation**: Just click the bookmark when viewing a Google Doc
- **Automatic URL detection**: Extracts the document URL automatically
- **Persistent settings**: Remembers your web app URL for future use
- **Clean interface**: Opens in a properly sized popup window
- **Error handling**: Validates that you're on a Google Docs page

## Security & Permissions

- The bookmarklet only runs on Google Docs pages (`docs.google.com/document/`)
- Your web app URL is stored locally in your browser (localStorage)
- The web app uses your Google account permissions to access documents
- Only documents you have edit access to can be processed

## Troubleshooting

**"Please provide a valid web app URL"**
- Make sure you've deployed your Google Apps Script as a web app
- Copy the full deployment URL, not the script editor URL

**"Permission denied" errors**
- Ensure you have edit access to the document
- Check that the web app is deployed with "Execute as: User accessing the web app"

**Bookmarklet doesn't work**
- Verify you're on a Google Docs page (not Google Drive or other Google services)
- Check browser console for JavaScript errors
- Try refreshing the page and clicking the bookmark again

## Technical Notes

This approach is more reliable than trying to extract links directly from the Google Docs DOM because:

1. Google Docs renders content in a complex canvas system
2. The actual document structure is not accessible via standard DOM methods
3. Google's Document API provides the official way to access document content
4. The web app approach works consistently across all browsers and document types