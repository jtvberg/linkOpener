function doGet(e) {
  console.log('doGet called with parameters:', e.parameter);
  return createSinglePageApp(e.parameter.docUrl);
}

function createSinglePageApp(initialDocUrl = '') {
  const html = `<!DOCTYPE html>
<html>
<head>
    <title>Inkling Tools</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        input[type="text"] { width: 100%; padding: 8px; margin: 10px 0; box-sizing: border-box; }
        button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .secondary { background: #f8f9fa; color: #333; border: 1px solid #ddd; }
        .loading { color: #666; margin: 10px 0; }
        .error { background: #fce8e6; color: #d93025; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .success { background: #e6f4ea; color: #137333; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .link-item { border: 1px solid #eee; margin: 5px 0; padding: 10px; border-radius: 3px; }
        .link-text { font-weight: bold; }
        .link-url { color: #666; font-size: 0.9em; word-break: break-all; }
        .auto-extract { background: #e8f0fe; color: #1a73e8; padding: 10px; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Google Docs Link Opener</h1>
    <div class="section" id="linksSection">
        <h3>Found Links</h3>
        <div id="documentInfo" style="background: #e8f0fe; color: #1a73e8; padding: 10px; border-radius: 4px; margin: 10px 0;">
            Processing document: ${initialDocUrl || 'Loading...'}
        </div>
        <div id="message"></div>
        <div id="linkControls" style="margin: 10px 0;">
            <button onclick="openAllValid()">Open All Valid Links</button>
            <button onclick="openSelected()" id="openSelected" style="display: none;">Open Selected</button>
            <button class="secondary" onclick="selectAll()">Select All</button>
            <button class="secondary" onclick="selectNone()">Clear All</button>
        </div>
        <div id="linksList"></div>
    </div>
    
    <script>
        let foundLinks = [];
        
        function showMessage(text, type = 'info') {
            const msg = document.getElementById('message');
            msg.innerHTML = '<div class="' + type + '">' + text + '</div>';
        }
        
        function extractLinks() {
            const docUrl = '${initialDocUrl}';
            if (!docUrl) {
                showMessage('No document URL provided', 'error');
                return;
            }
            
            showMessage('Extracting links...', 'loading');
            
            // Call the server-side function
            google.script.run
                .withSuccessHandler(onLinksExtracted)
                .withFailureHandler(onExtractionError)
                .extractLinksFromInput(docUrl);
        }
        
        function onLinksExtracted(links) {
            foundLinks = links;
            
            if (links.length === 0) {
                showMessage('No links found in the document', 'error');
                return;
            }
            
            showMessage('Found ' + links.length + ' links!', 'success');
            
            // Display links
            const linksList = document.getElementById('linksList');
            linksList.innerHTML = links.map((link, index) => 
                '<div class="link-item">' +
                '<input type="checkbox" id="link_' + index + '" ' + (link.isValid ? 'checked' : '') + ' onchange="updateButtons()">' +
                '<label for="link_' + index + '">' +
                '<div class="link-text">' + escapeHtml(link.text) + (link.isValid ? '' : ' (Invalid)') + '</div>' +
                '<div class="link-url">' + escapeHtml(link.url) + '</div>' +
                '</label>' +
                '</div>'
            ).join('');
            
            updateButtons();
        }
        
        function onExtractionError(error) {
            console.error('Extraction error:', error);
            console.error('Error details:', {
                message: error.message,
                type: typeof error,
                stack: error.stack
            });
            
            let userMessage = 'Error: ' + error.message;
            
            // Provide actionable error messages
            if (error.message.includes('Permission denied') || error.message.includes('Access denied')) {
                userMessage += '\n\nTry these steps:\n1. Refresh this page and sign in again\n2. Check that you have view/edit access to the document\n3. If this is your document, verify the web app permissions';
            } else if (error.message.includes('Service unavailable') || error.message.includes('Backend error')) {
                userMessage += '\n\nGoogle Docs service appears to be temporarily unavailable. Please try again in a few moments.';
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                userMessage += '\n\nService quota exceeded. Please wait a moment before trying again.';
            }
            
            showMessage(userMessage, 'error');
            
            // Add retry button for certain errors
            if (error.message.includes('Service unavailable') || error.message.includes('quota')) {
                setTimeout(() => {
                    const retryButton = '<button onclick="extractLinks()" style="margin-top: 10px;">Retry</button>';
                    document.getElementById('message').innerHTML += retryButton;
                }, 1000);
            }
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function updateButtons() {
            const checked = document.querySelectorAll('input[type="checkbox"]:checked').length;
            document.getElementById('openSelected').style.display = checked > 0 ? 'inline-block' : 'none';
        }
        
        function selectAll() {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
            updateButtons();
        }
        
        function selectNone() {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            updateButtons();
        }
        
        function openAllValid() {
            const validLinks = foundLinks.filter(link => link.isValid);
            openLinks(validLinks.map(link => link.url));
        }
        
        function openSelected() {
            const urls = [];
            document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
                const index = parseInt(cb.id.split('_')[1]);
                urls.push(foundLinks[index].url);
            });
            openLinks(urls);
        }
        
        function openLinks(urls) {
            if (urls.length === 0) {
                showMessage('No links selected', 'error');
                return;
            }
            
            showMessage('Opening ' + urls.length + ' links...', 'loading');
            
            let opened = 0;
            let failed = 0;
            const failures = [];
            
            // Check if popup blocker might interfere
            if (urls.length > 1) {
                const testWindow = window.open('', 'popupTest', 'width=1,height=1');
                if (!testWindow || testWindow.closed) {
                    showMessage('Popup blocker detected. Please allow popups for this site and try again.', 'error');
                    return;
                }
                testWindow.close();
            }
            
            urls.forEach((url, index) => {
                try {
                    // Add small delay between opens to avoid browser restrictions
                    setTimeout(() => {
                        try {
                            // Enhanced window.open with fallback
                            const newWindow = window.open(
                                url, 
                                'linkWindow_' + Date.now() + '_' + index, 
                                'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=yes,location=yes,menubar=yes,status=yes'
                            );
                            
                            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                                // Fallback: try without window features
                                const fallbackWindow = window.open(url, '_blank');
                                if (!fallbackWindow) {
                                    throw new Error('Popup blocked or failed');
                                }
                            }
                            
                            opened++;
                            
                            // Update status after last link
                            if (index === urls.length - 1) {
                                setTimeout(() => {
                                    if (failed > 0) {
                                        showMessage('Opened ' + opened + ' out of ' + urls.length + ' links. ' + failed + ' failed: ' + failures.join(', '), 'error');
                                    } else {
                                        showMessage('Successfully opened all ' + opened + ' links!', 'success');
                                    }
                                }, 500);
                            }
                            
                        } catch (error) {
                            console.error('Failed to open:', url, error);
                            failed++;
                            failures.push(url.substring(0, 50) + (url.length > 50 ? '...' : ''));
                            
                            // Update status after last link
                            if (index === urls.length - 1) {
                                setTimeout(() => {
                                    showMessage('Opened ' + opened + ' out of ' + urls.length + ' links. ' + failed + ' failed: ' + failures.join(', '), 'error');
                                }, 500);
                            }
                        }
                    }, index * 100); // 100ms delay between each link
                    
                } catch (error) {
                    console.error('Immediate error for:', url, error);
                    failed++;
                    failures.push(url.substring(0, 50) + (url.length > 50 ? '...' : ''));
                }
            });
        }
        
        // Auto-extract when page loads
        window.addEventListener('load', function() {
            const docUrl = '${initialDocUrl}';
            if (docUrl && docUrl.includes('docs.google.com')) {
                setTimeout(extractLinks, 500); // Give the page a moment to fully load
            } else {
                showMessage('No document URL provided or invalid URL', 'error');
            }
        });
    </script>
</body>
</html>`;

  return HtmlService.createHtmlOutput(html)
    .setTitle('Inkling Tools')
    .setWidth(800)
    .setHeight(600);
}

/**
 * Server-side function called by the client
 */
function extractLinksFromInput(input) {
  console.log('extractLinksFromInput called with:', input);
  
  try {
    let doc;
    
    // Enhanced input validation
    if (!input || typeof input !== 'string' || input.trim() === '') {
      throw new Error('Invalid input: Document URL or ID is required');
    }
    
    input = input.trim();
    
    if (input.includes('docs.google.com')) {
      console.log('Opening by URL');
      // Enhanced URL cleaning
      let cleanUrl = input;
      
      // Remove everything after /edit and common parameters
      cleanUrl = cleanUrl.split('/edit')[0];
      cleanUrl = cleanUrl.split('?')[0];
      cleanUrl = cleanUrl.split('#')[0];
      
      // Ensure it ends with proper format
      if (!cleanUrl.endsWith('/edit')) {
        cleanUrl += '/edit';
      }
      
      console.log('Original URL:', input);
      console.log('Cleaned URL:', cleanUrl);
      
      // Add retry logic for document access
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          doc = DocumentApp.openByUrl(cleanUrl);
          break;
        } catch (retryError) {
          attempts++;
          console.log(`Attempt ${attempts} failed:`, retryError.message);
          
          if (attempts >= maxAttempts) {
            throw retryError;
          }
          
          // Brief pause before retry
          Utilities.sleep(1000);
        }
      }
      
    } else {
      console.log('Opening by ID');
      // Extract document ID if it's embedded in a URL
      let docId = input;
      const idMatch = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (idMatch) {
        docId = idMatch[1];
        console.log('Extracted ID from URL:', docId);
      }
      
      doc = DocumentApp.openById(docId);
    }
    
    // Verify document access
    const docName = doc.getName();
    console.log('Document opened successfully:', docName);
    
    const links = extractAllLinksFromDocument(doc);
    console.log('Found', links.length, 'links');
    
    return links;
    
  } catch (error) {
    console.error('Error in extractLinksFromInput:', error);
    console.error('Error type:', typeof error);
    console.error('Error stack:', error.stack);
    
    // Enhanced error message handling
    let errorMessage = error.message || 'Unknown error occurred';
    
    if (errorMessage.includes('Permission denied') || errorMessage.includes('Access denied')) {
      errorMessage = 'Permission denied. Please ensure you have view/edit access to this document. Try refreshing your browser and signing in again.';
    } else if (errorMessage.includes('Invalid argument') || errorMessage.includes('not found') || errorMessage.includes('No item with the given ID')) {
      errorMessage = 'Document not found. Please verify the URL or ID is correct and the document exists.';
    } else if (errorMessage.includes('Service unavailable') || errorMessage.includes('Backend error')) {
      errorMessage = 'Google Docs service temporarily unavailable. Please try again in a moment.';
    } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      errorMessage = 'Service quota exceeded. Please wait a moment and try again.';
    }
    
    throw new Error(errorMessage);
  }
}

// Copy the required helper functions
function extractAllLinksFromDocument(doc) {
  console.log('Starting link extraction...');
  const body = doc.getBody();
  const links = [];
  
  function searchElement(element) {
    const type = element.getType();
    
    if (type === DocumentApp.ElementType.TEXT) {
      const textElement = element.asText();
      const text = textElement.getText();
      
      for (let i = 0; i < text.length; i++) {
        const url = textElement.getLinkUrl(i);
        if (url) {
          let startOffset = i;
          let endOffset = i;
          
          while (startOffset > 0 && textElement.getLinkUrl(startOffset - 1) === url) {
            startOffset--;
          }
          
          while (endOffset < text.length - 1 && textElement.getLinkUrl(endOffset + 1) === url) {
            endOffset++;
          }
          
          const linkText = text.substring(startOffset, endOffset + 1);
          
          if (!links.some(link => link.url === url && link.text === linkText)) {
            links.push({
              text: linkText.trim(),
              url: url,
              isValid: isValidUrl(url)
            });
          }
          
          i = endOffset;
        }
      }
    } else if (type === DocumentApp.ElementType.PARAGRAPH || 
               type === DocumentApp.ElementType.LIST_ITEM ||
               type === DocumentApp.ElementType.TABLE_CELL) {
      const numChildren = element.getNumChildren();
      for (let i = 0; i < numChildren; i++) {
        searchElement(element.getChild(i));
      }
    } else if (type === DocumentApp.ElementType.TABLE) {
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
  
  const numChildren = body.getNumChildren();
  for (let i = 0; i < numChildren; i++) {
    searchElement(body.getChild(i));
  }
  
  console.log('Link extraction complete. Found:', links.length);
  return links;
}

function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }
  
  if (url.startsWith('mailto:')) {
    return true;
  }
  
  if (url.includes('.') && !url.includes(' ')) {
    return true;
  }
  
  return false;
}