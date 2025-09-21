/**
 * Google Docs Link Opener Tool
 * This Google Apps Script automatically finds and opens all links in a Google Document
 */

/**
 * Adds a custom menu to the Google Docs interface when the document opens
 * Note: This only works if you own the document and the script is bound to it
 */
function onOpen() {
  try {
    const ui = DocumentApp.getUi();
    ui.createMenu('Link Opener')
      .addItem('Open All Links', 'openAllLinksDialog')
      .addItem('Extract Links Only', 'showLinksDialog')
      .addToUi();
  } catch (error) {
    console.log('onOpen() can only be called when script is bound to a document.');
    console.log('For standalone use, run processDocumentLinks() instead.');
  }
}

/**
 * Standalone function to process links from any document you have access to
 * Run this function from the Apps Script editor
 */
function processDocumentLinks() {
  // Prompt for document URL or ID using Browser.inputBox for standalone scripts
  let input;
  
  try {
    // Try using Browser.inputBox for standalone scripts
    input = Browser.inputBox(
      'Document URL or ID',
      'Enter the Google Docs URL or Document ID:',
      Browser.Buttons.OK_CANCEL
    );
    
    if (input === 'cancel' || !input) {
      console.log('Operation cancelled or no input provided.');
      return;
    }
  } catch (error) {
    // Fallback: provide instructions for manual input
    console.log('To use this script:');
    console.log('1. Replace DOCUMENT_ID_HERE with the actual document ID in the line below');
    console.log('2. Or use the full URL with processDocumentByUrl function');
    console.log('');
    console.log('Example document ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
    console.log('Example URL: https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
    console.log('');
    console.log('Uncomment one of these lines and run the function again:');
    console.log('// const doc = DocumentApp.openById("DOCUMENT_ID_HERE");');
    console.log('// const doc = DocumentApp.openByUrl("FULL_DOCUMENT_URL_HERE");');
    
    return;
  }
  
  try {
    let doc;
    if (input.includes('docs.google.com')) {
      doc = DocumentApp.openByUrl(input);
    } else {
      doc = DocumentApp.openById(input);
    }
    
    // Process the document
    processDocument(doc);
    
  } catch (error) {
    console.error('Error accessing document:', error);
    console.log('Could not access the document. Make sure you have edit access and the URL/ID is correct.');
    console.log('Error details: ' + error.message);
  }
}

/**
 * Alternative function for when you want to hardcode the document ID
 * Replace DOCUMENT_ID_HERE with your actual document ID
 */
function processSpecificDocument() {
  const DOCUMENT_ID = 'DOCUMENT_ID_HERE'; // Replace with actual document ID
  
  try {
    const doc = DocumentApp.openById(DOCUMENT_ID);
    processDocument(doc);
  } catch (error) {
    console.error('Error accessing document:', error);
    console.log('Make sure to replace DOCUMENT_ID_HERE with the actual document ID');
  }
}

/**
 * Alternative function for when you want to hardcode the document URL
 * Replace DOCUMENT_URL_HERE with your actual document URL
 */
function processDocumentByUrl() {
  const DOCUMENT_URL = 'DOCUMENT_URL_HERE'; // Replace with actual document URL
  
  try {
    const doc = DocumentApp.openByUrl(DOCUMENT_URL);
    processDocument(doc);
  } catch (error) {
    console.error('Error accessing document:', error);
    console.log('Make sure to replace DOCUMENT_URL_HERE with the actual document URL');
  }
}

/**
 * Helper function to get document by ID
 */
function getDocumentById(documentId) {
  return DocumentApp.openById(documentId);
}

/**
 * Helper function to get document by URL
 */
function getDocumentByUrl(documentUrl) {
  return DocumentApp.openByUrl(documentUrl);
}

/**
 * Process a specific document for links
 */
function processDocument(doc) {
  try {
    const links = extractAllLinksFromDocument(doc);
    
    if (links.length === 0) {
      console.log('No links found in the document.');
      return;
    }
    
    console.log(`Found ${links.length} links in the document:`);
    links.forEach((link, index) => {
      console.log(`${index + 1}. ${link.text} -> ${link.url} ${link.isValid ? '' : '(Invalid)'}`);
    });
    
    // Create HTML dialog for link opening
    try {
      const html = createLinkDialog(links, 'open');
      
      // Try to display the HTML dialog in a new window/tab
      const htmlContent = html.getContent();
      
      // For standalone scripts, we'll create a web app or use HtmlService
      const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
        .setWidth(600)
        .setHeight(800);
        
      // Since we can't use DocumentApp.getUi() in standalone context,
      // we'll use a different approach - create a temporary web app
      console.log('Links extracted successfully!');
      console.log('To open the interactive dialog:');
      console.log('1. Deploy this script as a web app');
      console.log('2. Or copy the links from the console output above');
      console.log('3. Or use the openLinksFromConsole() function');
      
    } catch (error) {
      console.log('Could not create dialog in this context.');
      console.log('Links are listed above in the console.');
    }
    
  } catch (error) {
    console.error('Error processing document:', error);
  }
}

/**
 * Opens all valid links found in the last processed document
 * Run this after processDocumentLinks() to open the links
 */
function openLinksFromConsole() {
  console.log('Note: This function would need to be enhanced to store the last found links.');
  console.log('For now, copy the URLs from the console output and open them manually.');
  console.log('Or deploy the script as a web app for the full interactive experience.');
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
 * Standalone version that works with any document you have access to
 */
function openAllLinksFromDocument(doc) {
  try {
    const links = extractAllLinksFromDocument(doc);
    
    if (links.length === 0) {
      console.log('No hyperlinks were found in this document.');
      return;
    }
    
    const html = createLinkDialog(links, 'open');
    
    // Try to show dialog in different contexts
    if (typeof DocumentApp !== 'undefined' && DocumentApp.getUi) {
      DocumentApp.getUi().showModalDialog(html, 'Open All Links');
    } else if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
      SpreadsheetApp.getUi().showModalDialog(html, 'Open All Links');
    } else {
      console.log('Dialog cannot be displayed in this context. Links found:');
      links.forEach((link, index) => {
        console.log(`${index + 1}. ${link.text} -> ${link.url}`);
      });
    }
  } catch (error) {
    console.error('Error in openAllLinksFromDocument:', error);
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
  return extractAllLinksFromDocument(doc);
}

/**
 * Extracts all hyperlinks from a specified Google Document
 * @param {Document} doc The Google Document to extract links from
 * @return {Array} Array of objects containing link text and URL
 */
function extractAllLinksFromDocument(doc) {
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