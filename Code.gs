/**
 * Google Docs Link Opener Tool
 * This Google Apps Script automatically finds and opens all links in a Google Document
 */

/**
 * Adds a custom menu to the Google Docs interface when the document opens
 */
function onOpen() {
  const ui = DocumentApp.getUi();
  ui.createMenu('Link Opener')
    .addItem('Open All Links', 'openAllLinksDialog')
    .addItem('Extract Links Only', 'showLinksDialog')
    .addToUi();
}

/**
 * Shows a dialog with all links found in the document and option to open them
 */
function openAllLinksDialog() {
  try {
    const links = extractAllLinks();
    
    if (links.length === 0) {
      DocumentApp.getUi().alert('No links found', 'No hyperlinks were found in this document.', DocumentApp.getUi().ButtonSet.OK);
      return;
    }
    
    const html = createLinkDialog(links, 'open');
    DocumentApp.getUi().showModalDialog(html, 'Open All Links');
  } catch (error) {
    console.error('Error in openAllLinksDialog:', error);
    DocumentApp.getUi().alert('Error', 'An error occurred while processing links: ' + error.message, DocumentApp.getUi().ButtonSet.OK);
  }
}

/**
 * Shows a dialog with all links found in the document for preview only
 */
function showLinksDialog() {
  try {
    const links = extractAllLinks();
    
    if (links.length === 0) {
      DocumentApp.getUi().alert('No links found', 'No hyperlinks were found in this document.', DocumentApp.getUi().ButtonSet.OK);
      return;
    }
    
    const html = createLinkDialog(links, 'preview');
    DocumentApp.getUi().showModalDialog(html, 'Links Found in Document');
  } catch (error) {
    console.error('Error in showLinksDialog:', error);
    DocumentApp.getUi().alert('Error', 'An error occurred while processing links: ' + error.message, DocumentApp.getUi().ButtonSet.OK);
  }
}

/**
 * Creates the HTML dialog with data injected directly
 * This avoids the need for google.script.run calls that cause transport errors
 */
function createLinkDialog(links, mode) {
  // Read the HTML template
  let html = HtmlService.createHtmlOutputFromFile('LinkDialog');
  
  // Get the HTML content and inject the data
  let htmlContent = html.getContent();
  
  // Create the data object
  const dialogData = {
    links: links,
    mode: mode
  };
  
  // Inject the data into the HTML by replacing the placeholder
  const dataScript = `<script>
    DIALOG_DATA = ${JSON.stringify(dialogData)};
    if (typeof setDialogData === 'function') {
      setDialogData(DIALOG_DATA);
    }
  </script>`;
  
  // Insert the data script before the closing body tag
  htmlContent = htmlContent.replace('</body>', dataScript + '</body>');
  
  // Create new HTML output with the modified content
  return HtmlService.createHtmlOutput(htmlContent)
    .setWidth(600)
    .setHeight(800);
}

/**
 * Extracts all hyperlinks from the current Google Document
 * @return {Array} Array of objects containing link text and URL
 */
function extractAllLinks() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const links = [];
  
  // Get all text elements in the document
  const textElements = body.getType() === DocumentApp.ElementType.TEXT ? [body] : [];
  
  // Recursively search through all elements
  function searchElement(element) {
    const type = element.getType();
    
    if (type === DocumentApp.ElementType.TEXT) {
      const textElement = element.asText();
      const text = textElement.getText();
      
      // Check each character for links
      for (let i = 0; i < text.length; i++) {
        const url = textElement.getLinkUrl(i);
        if (url) {
          // Find the extent of this link
          let startOffset = i;
          let endOffset = i;
          
          // Find start of link
          while (startOffset > 0 && textElement.getLinkUrl(startOffset - 1) === url) {
            startOffset--;
          }
          
          // Find end of link
          while (endOffset < text.length - 1 && textElement.getLinkUrl(endOffset + 1) === url) {
            endOffset++;
          }
          
          const linkText = text.substring(startOffset, endOffset + 1);
          
          // Add link if not already found
          if (!links.some(link => link.url === url && link.text === linkText)) {
            links.push({
              text: linkText.trim(),
              url: url,
              isValid: isValidUrl(url)
            });
          }
          
          // Skip to end of this link
          i = endOffset;
        }
      }
    } else if (type === DocumentApp.ElementType.PARAGRAPH || 
               type === DocumentApp.ElementType.LIST_ITEM ||
               type === DocumentApp.ElementType.TABLE_CELL) {
      // Recursively search child elements
      const numChildren = element.getNumChildren();
      for (let i = 0; i < numChildren; i++) {
        searchElement(element.getChild(i));
      }
    } else if (type === DocumentApp.ElementType.TABLE) {
      // Handle table elements
      const table = element.asTable();
      const numRows = table.getNumRows();
      for (let i = 0; i < numRows; i++) {
        const row = table.getRow(i);
        const numCells = row.getNumCells();
        for (let j = 0; j < numCells; j++) {
          searchElement(row.getCell(j));
        }
      }
    }
  }
  
  // Start recursive search from body
  const numChildren = body.getNumChildren();
  for (let i = 0; i < numChildren; i++) {
    searchElement(body.getChild(i));
  }
  
  return links;
}

/**
 * Validates if a URL is properly formatted
 * @param {string} url The URL to validate
 * @return {boolean} True if URL is valid
 */
function isValidUrl(url) {
  try {
    // Basic URL validation
    if (!url || typeof url !== 'string') return false;
    
    // Check if it starts with http or https
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return true;
    }
    
    // Check if it's a mailto link
    if (url.startsWith('mailto:')) {
      return true;
    }
    
    // Check if it contains common URL patterns
    if (url.includes('.') && !url.includes(' ')) {
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}