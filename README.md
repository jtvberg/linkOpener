# Google Docs Link Opener Tool

A Google Apps Script tool that automatically finds and opens all hyperlinks in a Google Document in new browser tabs. Available as both a document-bound script and a standalone web app.

## 🎯 Choose Your Installation Method

### 📱 **Web App (Recommended for Public Use)**
- ✅ Works with any Google Doc (even docs you don't own)
- ✅ Shareable URL - anyone can use it
- ✅ No need to install anything in each document
- ✅ Better for teams and collaboration

### 📋 **Document-Bound Script**
- ✅ Integrates directly into Google Docs menu
- ✅ Familiar interface within the document
- ❌ Must be installed in each document you own
- ❌ Only works with documents you own

## Features

- 🔗 **Automatic Link Detection**: Scans the entire Google Document for hyperlinks
- 🎯 **Selective Opening**: Choose which links to open with checkboxes
- ✅ **Link Validation**: Identifies and flags invalid or malformed URLs
- 📊 **Link Preview**: View all found links before opening them
- 🚀 **Batch Opening**: Opens multiple links in new tabs with smart delays to prevent browser blocking
- 🎨 **Clean Interface**: User-friendly dialog with modern design
- ⚡ **Fast Processing**: Efficiently processes documents of any size
- 🔐 **Multi-User Support**: Web app version works for any user with document access

## Installation

### 🚀 Option A: Web App Deployment (Recommended)

**Best for**: Teams, shared documents, public use

1. **Create the project**
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"
   - Name it "Google Docs Link Opener"

2. **Set up the files**
   - Replace `Code.gs` content with `WebApp_Auth.gs` from this repository
   - Replace `appsscript.json` content with the provided configuration
   - Save the project

3. **Deploy as web app**
   - Click "Deploy" → "New deployment"
   - Choose type: "Web app"
   - Execute as: **"User accessing the web app"** (Critical!)
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the web app URL

4. **Share the URL**
   - Anyone can use the web app URL to extract links from Google Docs they have access to
   - No installation needed for individual documents

### 📋 Option B: Document-Bound Script

**Best for**: Personal use in documents you own

1. **Open Google Apps Script**
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"

2. **Set up the files**
   - Replace the default `Code.gs` content with the code from `Code.gs` in this repository
   - Click the "+" button next to "Files" and select "HTML"
   - Name it `LinkDialog` and paste the content from `LinkDialog.html`
   - Replace `appsscript.json` content with the provided configuration

3. **Save and Deploy**
   - Click "Save" (Ctrl/Cmd + S)
   - Give your project a name like "Google Docs Link Opener"

## Usage

### 🚀 Web App Usage

1. **Open the web app** using the URL from your deployment
2. **Paste a Google Doc URL or ID** in the input field
3. **Click "Extract Links"** to scan the document
4. **Authorize the app** if prompted (first time only)
5. **Select which links to open** using checkboxes
6. **Click "Open Selected Links"** to open them in new tabs

**Supported input formats**:
- Full URL: `https://docs.google.com/document/d/YOUR_DOC_ID/edit`
- Document ID: `YOUR_DOC_ID`

### 📋 Document-Bound Script Usage

#### Setting Up in a Google Document

1. **Open any Google Document** where you want to use the tool
2. **Run the script for the first time**:
   - Go to [script.google.com](https://script.google.com)
   - Open your "Google Docs Link Opener" project
   - Run the `onOpen` function manually (this is only needed once)
   - Grant necessary permissions when prompted

3. **Refresh your Google Document** - you should now see a "Link Opener" menu

#### Using the Tool

##### Option 1: Open All Links
1. In your Google Document, click **"Link Opener" → "Open All Links"**
2. Review the found links in the dialog
3. Select/deselect links using checkboxes
4. Click **"Open Selected Links"** to open them in new tabs

##### Option 2: Preview Links Only
1. Click **"Link Opener" → "Extract Links Only"**
2. View all links found in the document
3. Use this to review links without opening them

### ⚠️ Important Browser Setup

**To open multiple links, you MUST allow popups for Google Docs:**

#### Chrome:
1. When you first try to open links, Chrome will show a popup blocked icon in the address bar
2. Click the icon and select **"Always allow popups and redirects from docs.google.com"**

#### Firefox:
1. Go to Settings → Privacy & Security → Permissions → Block pop-up windows → Exceptions
2. Add `https://docs.google.com` to the allowed list

#### Safari:
1. Go to Safari → Preferences → Websites → Pop-up Windows
2. Set docs.google.com to "Allow"

**Without this step, only the first link will open!**

### Interface Features

- **Select All/None/Valid Only**: Quick selection buttons
- **Link Validation**: Invalid links are marked with red text and "Invalid" badge
- **Bulk Opening**: Opens all selected links simultaneously 
- **Progress Feedback**: Shows success/error messages and processing status

## Technical Details

### File Structure

```
linkOpener/
├── WebApp_Auth.gs       # 🚀 MAIN: Web app version with authorization handling
├── Code.gs              # 📋 Document-bound script for menu integration
├── LinkDialog.html      # HTML interface for document-bound version
├── appsscript.json      # Google Apps Script configuration with OAuth scopes
├── WebApp_Simple.gs     # Alternative web app version (simpler)
├── WebApp_Debug.gs      # Debug version with extensive logging
├── WebApp.gs           # Original web app (redirect-based, not recommended)
├── WEBAPP_VERSIONS.md   # Detailed comparison of all versions
└── README.md           # This documentation
```

**Which file to use?**
- **For web app**: Use `WebApp_Auth.gs` (most robust)
- **For document menu**: Use `Code.gs` + `LinkDialog.html`

### Key Functions

- **`onOpen()`**: Adds custom menu to Google Docs
- **`extractAllLinks()`**: Recursively scans document for hyperlinks
- **`openAllLinksDialog()`**: Shows dialog for opening links
- **`showLinksDialog()`**: Shows dialog for previewing links only
- **`isValidUrl()`**: Validates URL format
- **`processLinkOpening()`**: Handles server-side link processing

### Supported Link Types

- HTTP/HTTPS URLs (http://example.com, https://example.com)
- Email links (mailto:user@example.com)
- Other URL schemes that contain periods and no spaces

### Browser Compatibility

- Works in all modern browsers
- Popup blocking may affect link opening (ensure popups are allowed for Google Docs)
- Best experience in Chrome, Firefox, Safari, and Edge

## Permissions Required

The script requires the following permissions:
- **Document access**: To read the current Google Document content
- **Display dialogs**: To show the link selection interface

## Troubleshooting

### Web App Issues

#### Authorization Loops
**Problem**: Users get stuck in repeated authorization prompts
**Solution**: 
- Ensure you're using `WebApp_Auth.gs`
- Verify deployment uses "User accessing the web app"
- Check that `appsscript.json` has the correct OAuth scopes

#### Permission Denied Errors
**Problem**: Can't access the document
**Solutions**:
- Verify the user has at least view access to the document
- Check that the document URL/ID is correct
- Ensure web app is deployed with "User accessing" execution

#### Blank Pages
**Problem**: Web app shows blank page
**Solutions**:
- Use `WebApp_Auth.gs` (single-page design)
- Avoid browser popup blockers
- Check browser console for JavaScript errors

### Document-Bound Script Issues

#### Links not opening
- **Check popup blocker**: Ensure your browser allows popups from Google Docs
- **Try fewer links**: Some browsers limit simultaneous tab opening
- **Refresh the page**: If the menu doesn't appear, refresh the Google Document

#### Menu not appearing
- **Run setup**: Manually run the `onOpen()` function in Google Apps Script
- **Check permissions**: Ensure you've granted all required permissions
- **Refresh document**: Close and reopen the Google Document

#### Invalid links detected
- **Review URLs**: Check if the links in your document are properly formatted
- **Manual verification**: Invalid links can still be selected and opened if needed
- **Copy issues**: Sometimes copy-pasted links may have formatting issues

## Advanced Usage

### Customization

You can modify the script to:
- Add support for additional URL schemes
- Change the link validation rules
- Customize the interface appearance
- Add logging or analytics

### Integration

The tool can be:
- Shared with specific Google Docs
- Deployed as a Google Workspace add-on
- Modified to work with Google Sheets or Slides

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with various document types
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the browser console for JavaScript errors
3. Check the Google Apps Script execution logs
4. Open an issue on GitHub with detailed information

## Version History

- **v1.0.0**: Initial release with core functionality
  - Link detection and extraction
  - HTML dialog interface
  - Link validation
  - Batch opening capabilities

---

**Made with ❤️ for Google Docs power users**