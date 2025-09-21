# Chrome Extension Installation Guide

## Quick Installation

### Method 1: Load Unpacked (Development)
1. **Download** or clone this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable "Developer mode"** (toggle switch in top-right corner)
4. **Click "Load unpacked"** button
5. **Select** the `chrome-extension` folder from this repository
6. **Pin the extension** by clicking the puzzle piece icon in the toolbar

### Method 2: Manual Installation
1. **Download the extension files** from the `chrome-extension` folder
2. **Create a new folder** on your computer (e.g., `google-docs-link-opener`)
3. **Copy all files** from the `chrome-extension` folder into your new folder
4. **Follow steps 2-6** from Method 1 above

## Usage

### Option A: Automatic Button (Recommended)
- The extension automatically adds a "🔗 Open Links" button to the Google Docs toolbar
- Simply click the button when viewing any Google Document
- The button appears near the other formatting tools

### Option B: Extension Popup
- Click the extension icon in your browser toolbar
- Works on any Google Docs page
- Useful if the automatic button doesn't appear

### Option C: Right-click Menu (Future Enhancement)
- Could be added to provide context menu access
- Would work by right-clicking anywhere in a Google Doc

## Features

✅ **Automatic Integration** - Button appears in Google Docs toolbar  
✅ **Smart Link Detection** - Finds links using multiple methods  
✅ **Selective Opening** - Choose which links to open  
✅ **Link Validation** - Identifies and flags invalid URLs  
✅ **Popup Blocking Prevention** - Smart delays between opening links  
✅ **Google Design Language** - Matches Google Docs interface  

## Browser Compatibility

- ✅ **Chrome** (Primary target)
- ✅ **Edge** (Chromium-based)
- ⚠️ **Brave** (Should work, may need testing)
- ❌ **Firefox** (Would need adaptation)
- ❌ **Safari** (Would need different approach)

## Permissions Explained

The extension requests these permissions:

- **`activeTab`** - Access to the current Google Docs tab to extract links
- **`scripting`** - Ability to inject the link extraction script
- **`https://docs.google.com/*`** - Only works on Google Docs pages

## Troubleshooting

### Button Doesn't Appear
1. **Refresh the page** - Try reloading the Google Doc
2. **Check extension is enabled** - Go to `chrome://extensions/`
3. **Wait for page load** - Let the document fully load before expecting the button
4. **Use popup fallback** - Click the extension icon instead

### No Links Found
1. **Ensure document has links** - Check that there are actually hyperlinks in the document
2. **Wait for content load** - Some documents take time to fully render
3. **Try scrolling** - Scroll through the document to ensure all content is loaded
4. **Check link format** - Some embedded links might not be detected

### Links Won't Open
1. **Check popup blocker** - Disable popup blocking for Google Docs
2. **Try fewer links** - Open links in smaller batches
3. **Check link validity** - Invalid links will be marked but won't open

### Performance Issues
1. **Large documents** - Very long documents might take time to process
2. **Many links** - Documents with 50+ links might be slower
3. **Browser resources** - Close other tabs if experiencing slowdown

## Development

### File Structure
```
chrome-extension/
├── manifest.json      # Extension configuration
├── content.js         # Main functionality, runs on Google Docs pages
├── popup.html         # Extension popup interface
├── popup.js           # Popup functionality
├── styles.css         # Styling for all elements
└── icons/            # Extension icons (if added)
```

### Key Components

**`manifest.json`**
- Defines extension permissions and behavior
- Specifies which pages the extension runs on
- Configures the popup interface

**`content.js`**
- Main script that runs on Google Docs pages
- Adds the button to the toolbar
- Handles link extraction and opening
- Creates the modal dialog interface

**`popup.html/js`**
- Backup interface accessible via extension icon
- Provides alternative access method
- Useful for troubleshooting

### Customization

**Change Button Text**
Edit line in `content.js`:
```javascript
🔗 Open Links  // Change this text
```

**Modify Appearance**
Edit styles in `styles.css`:
```css
.link-opener-button button {
  background: #1a73e8;  /* Change button color */
  /* Other styling... */
}
```

**Adjust Link Opening Delay**
Edit delay in `content.js`:
```javascript
const delay = 100; // Change delay between opening links (milliseconds)
```

## Publishing to Chrome Web Store

To distribute the extension publicly:

1. **Prepare for submission**
   - Add proper icons (16x16, 48x48, 128x128)
   - Write detailed description
   - Add screenshots
   - Test thoroughly

2. **Developer registration**
   - Create Google Developer account
   - Pay one-time $5 registration fee

3. **Submit extension**
   - Upload extension package
   - Fill out store listing
   - Wait for review (typically 1-3 days)

## Security & Privacy

The extension:
- ✅ Only works on Google Docs pages
- ✅ Doesn't send data to external servers
- ✅ Uses your existing Google account permissions
- ✅ Only accesses links you can already see
- ✅ Runs entirely in your browser

## Updates

To update the extension:
1. **Download new version** from repository
2. **Replace old files** in your extension folder
3. **Refresh extension** in `chrome://extensions/`
4. **Reload Google Docs page** to get new functionality

## Uninstallation

To remove the extension:
1. Go to `chrome://extensions/`
2. Find "Google Docs Link Opener"
3. Click "Remove"
4. Confirm removal

The extension leaves no traces after removal.

## Support

For issues or questions:
1. Check this troubleshooting guide
2. Try the bookmarklet alternative
3. Open an issue in the GitHub repository
4. Include your Chrome version and any error messages