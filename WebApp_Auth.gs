/**
 * Simple Single-Page Web App - No Redirects
 * This version keeps everything on one page to avoid redirect issues
 */

function doGet(e) {
  console.log('doGet called');
  return createSinglePageApp();
}

function createSinglePageApp() {
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
    </style>
</head>
<body>
    <h1>Google Docs Link Opener</h1>
    
    <div class="section">
        <h3>Step 1: Enter Document</h3>
        <p><strong>Important:</strong> You must have edit access to the document. The document can be:</p>
        <ul>
            <li>A document you created</li>
            <li>A document shared with you with edit permissions</li>
            <li>A document in a shared drive you have access to</li>
        </ul>
        <input type="text" id="docInput" placeholder="Paste Google Docs URL or Document ID here">
        <br>
        <button onclick="extractLinks()">Extract Links</button>
        <div id="message"></div>
    </div>
    
    <div class="section" id="linksSection" style="display: none;">
        <h3>Step 2: Found Links</h3>
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
            const input = document.getElementById('docInput').value.trim();
            if (!input) {
                showMessage('Please enter a document URL or ID', 'error');
                return;
            }
            
            showMessage('Extracting links...', 'loading');
            
            // Call the server-side function
            google.script.run
                .withSuccessHandler(onLinksExtracted)
                .withFailureHandler(onExtractionError)
                .extractLinksFromInput(input);
        }
        
        function onLinksExtracted(links) {
            foundLinks = links;
            
            if (links.length === 0) {
                showMessage('No links found in the document', 'error');
                document.getElementById('linksSection').style.display = 'none';
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
            
            document.getElementById('linksSection').style.display = 'block';
            updateButtons();
        }
        
        function onExtractionError(error) {
            console.error('Extraction error:', error);
            showMessage('Error: ' + error.message, 'error');
            document.getElementById('linksSection').style.display = 'none';
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
            urls.forEach(url => {
                try {
                    window.open(url, '_blank');
                    opened++;
                } catch (error) {
                    console.error('Failed to open:', url, error);
                }
            });
            
            setTimeout(() => {
                showMessage('Opened ' + opened + ' out of ' + urls.length + ' links', 'success');
            }, 1000);
        }
        
        // Allow Enter key to submit
        document.getElementById('docInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                extractLinks();
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
  console.log('Running as user:', Session.getActiveUser().getEmail());
  
  try {
    let doc;
    
    if (input.includes('docs.google.com')) {
      console.log('Opening by URL');
      // Clean the URL
      let cleanUrl = input;
      if (cleanUrl.includes('?')) {
        cleanUrl = cleanUrl.split('?')[0];
      }
      if (cleanUrl.includes('#')) {
        cleanUrl = cleanUrl.split('#')[0];
      }
      console.log('Cleaned URL:', cleanUrl);
      doc = DocumentApp.openByUrl(cleanUrl);
    } else {
      console.log('Opening by ID');
      doc = DocumentApp.openById(input);
    }
    
    console.log('Document opened:', doc.getName());
    
    const links = extractAllLinksFromDocument(doc);
    console.log('Found', links.length, 'links');
    
    return links;
    
  } catch (error) {
    console.error('Error in extractLinksFromInput:', error);
    
    // Provide more helpful error messages
    let errorMessage = error.message;
    
    if (error.message.includes('Permission denied') || error.message.includes('Access denied')) {
      errorMessage = 'Permission denied. Make sure you have edit access to this document. If this is your document, the web app might need to be configured to run as "User accessing the web app" instead of the script owner.';
    } else if (error.message.includes('Invalid argument') || error.message.includes('not found')) {
      errorMessage = 'Document not found. Please check that the URL or ID is correct and the document exists.';
    } else if (error.message.includes('No item with the given ID could be found')) {
      errorMessage = 'Document ID not found. Please check that the document ID is correct and you have access to the document.';
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