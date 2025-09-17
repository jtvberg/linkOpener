# Google Docs Link Opener Tool

A Google Apps Script tool that automatically finds and opens all hyperlinks in a Google Document in new browser tabs. This tool is perfect for quickly accessing multiple references, resources, or links mentioned in a document without manually clicking each one.

## Features

- 🔗 **Automatic Link Detection**: Scans the entire Google Document for hyperlinks
- 🎯 **Selective Opening**: Choose which links to open with checkboxes
- ✅ **Link Validation**: Identifies and flags invalid or malformed URLs
- 📊 **Link Preview**: View all found links before opening them
- 🚀 **Batch Opening**: Opens multiple links in new tabs with smart delays to prevent browser blocking
- 🎨 **Clean Interface**: User-friendly dialog with modern design
- ⚡ **Fast Processing**: Efficiently processes documents of any size

## Installation

### Method 1: Copy and Paste (Recommended)

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

### Method 2: Clone and Import

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/linkOpener.git
   ```

2. Copy the files to your Google Apps Script project following Method 1 steps 2-3.

## Usage

### Setting Up in a Google Document

1. **Open any Google Document** where you want to use the tool
2. **Run the script for the first time**:
   - Go to [script.google.com](https://script.google.com)
   - Open your "Google Docs Link Opener" project
   - Run the `onOpen` function manually (this is only needed once)
   - Grant necessary permissions when prompted

3. **Refresh your Google Document** - you should now see a "Link Opener" menu

### Using the Tool

#### Option 1: Open All Links
1. In your Google Document, click **"Link Opener" → "Open All Links"**
2. Review the found links in the dialog
3. Select/deselect links using checkboxes
4. Click **"Open Selected Links"** to open them in new tabs

#### Option 2: Preview Links Only
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
├── Code.gs              # Main Google Apps Script logic
├── LinkDialog.html      # HTML interface for user interaction
├── appsscript.json     # Google Apps Script configuration
└── README.md           # This documentation
```

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

### Links not opening
- **Check popup blocker**: Ensure your browser allows popups from Google Docs
- **Try fewer links**: Some browsers limit simultaneous tab opening
- **Refresh the page**: If the menu doesn't appear, refresh the Google Document

### Menu not appearing
- **Run setup**: Manually run the `onOpen()` function in Google Apps Script
- **Check permissions**: Ensure you've granted all required permissions
- **Refresh document**: Close and reopen the Google Document

### Invalid links detected
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