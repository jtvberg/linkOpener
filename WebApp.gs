/**
 * Web App functions for standalone Link Opener
 * Deploy this as a web app to get the full interactive experience
 * 
 * This file contains all necessary functions to work independently
 */

/**
 * Serves the main web app page
 */
function doGet(e) {
  const documentId = e.parameter.docId;
  const documentUrl = e.parameter.docUrl;
  
  if (documentId || documentUrl) {
    return processDocumentForWebApp(documentId, documentUrl);
  }
  
  // Show input form
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Link Opener - Standalone</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="text"] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
            button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
            button:hover { background: #3367d6; }
            .help { background: #f0f0f0; padding: 15px; border-radius: 4px; margin-top: 20px; }
            .loading { text-align: center; color: #666; margin-top: 20px; }
            .error { background: #fce8e6; color: #d93025; padding: 15px; border-radius: 4px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <h1>Google Docs Link Opener</h1>
        <p>Extract and open all links from any Google Document you have access to.</p>
        
        <form>
            <div class="form-group">
                <label for="docInput">Document URL or ID:</label>
                <input type="text" id="docInput" placeholder="https://docs.google.com/document/d/.../edit or just the document ID">
            </div>
            <button type="button" onclick="processDocument()">Extract Links</button>
        </form>
        
        <div id="loading" class="loading" style="display: none;">
            Processing document... Please wait.
        </div>
        
        <div id="error" class="error" style="display: none;">
        </div>
        
        <div class="help">
            <h3>How to use:</h3>
            <ol>
                <li>Copy the URL of the Google Document you want to process</li>
                <li>Paste it in the field above (or just the document ID)</li>
                <li>Click "Extract Links" to see all links in the document</li>
                <li>You can then select which links to open</li>
            </ol>
            
            <h4>Document ID vs URL:</h4>
            <p>You can use either:</p>
            <ul>
                <li><strong>Full URL:</strong> https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit</li>
                <li><strong>Just the ID:</strong> 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</li>
            </ul>
        </div>
        
        <script>
            function processDocument() {
                const input = document.getElementById('docInput').value.trim();
                if (!input) {
                    showError('Please enter a document URL or ID');
                    return;
                }
                
                // Show loading state
                document.getElementById('loading').style.display = 'block';
                document.getElementById('error').style.display = 'none';
                
                let url = window.location.href.split('?')[0]; // Remove existing parameters
                if (input.includes('docs.google.com')) {
                    url += '?docUrl=' + encodeURIComponent(input);
                } else {
                    url += '?docId=' + encodeURIComponent(input);
                }
                
                window.location.href = url;
            }
            
            function showError(message) {
                const errorDiv = document.getElementById('error');
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                document.getElementById('loading').style.display = 'none';
            }
            
            // Allow Enter key to submit
            document.getElementById('docInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    processDocument();
                }
            });
        </script>
    </body>
    </html>
  `).setTitle('Link Opener - Standalone');
}
}

/**
 * Process document and return the link dialog
 */
function processDocumentForWebApp(documentId, documentUrl) {
  try {
    let doc;
    if (documentUrl) {
      doc = DocumentApp.openByUrl(documentUrl);
    } else if (documentId) {
      doc = DocumentApp.openById(documentId);
    } else {
      throw new Error('No document ID or URL provided');
    }
    
    const links = extractAllLinksFromDocument(doc);
    
    if (links.length === 0) {
      return HtmlService.createHtmlOutput(`
        <html>
        <head>
            <title>No Links Found</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px; }
                button:hover { background: #3367d6; }
            </style>
        </head>
        <body>
            <h2>No Links Found</h2>
            <p>No hyperlinks were found in this document.</p>
            <button onclick="history.back()">Go Back</button>
        </body>
        </html>
      `).setTitle('No Links Found');
    }
    
    // Create the link dialog with web app modifications
    const html = createLinkDialogForWebApp(links, 'open');
    
    return html.setTitle('Links Found in Document')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    return HtmlService.createHtmlOutput(`
      <html>
      <head>
          <title>Error</title>
          <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .error { background: #fce8e6; color: #d93025; padding: 15px; border-radius: 5px; margin: 20px 0; }
              button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
              button:hover { background: #3367d6; }
          </style>
      </head>
      <body>
          <h2>Error</h2>
          <div class="error">
              <p><strong>Could not access the document:</strong> ${error.message}</p>
          </div>
          <p><strong>Make sure:</strong></p>
          <ul>
              <li>You have edit access to the document</li>
              <li>The URL or ID is correct</li>
              <li>The document exists and is accessible</li>
          </ul>
          <button onclick="history.back()">Go Back</button>
      </body>
      </html>
    `).setTitle('Error');
  }
}

/**
 * Extract all hyperlinks from a specified Google Document
 * (Copy of the function from Code.gs for web app independence)
 */
function extractAllLinksFromDocument(doc) {
  const body = doc.getBody();
  const links = [];
  
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
 * (Copy of the function from Code.gs for web app independence)
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

/**
 * Creates the HTML dialog for web app with data injected directly
 * (Modified version of createLinkDialog for web app compatibility)
 */
function createLinkDialogForWebApp(links, mode) {
  // Create the data object
  const dialogData = {
    links: links,
    mode: mode
  };
  
  // Create the complete HTML content
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Link Opener</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 100%;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #4285f4;
        }
        
        .header h2 {
            color: #1a73e8;
            margin: 0;
            font-size: 24px;
        }
        
        .stats {
            background: #e8f0fe;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
            color: #1967d2;
            font-weight: 500;
        }
        
        .link-list {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #dadce0;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .link-item {
            display: flex;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #f1f3f4;
            transition: background-color 0.2s;
        }
        
        .link-item:hover {
            background-color: #f8f9fa;
        }
        
        .link-item:last-child {
            border-bottom: none;
        }
        
        .link-checkbox {
            margin-right: 12px;
            transform: scale(1.2);
        }
        
        .link-content {
            flex: 1;
            min-width: 0;
        }
        
        .link-text {
            font-weight: 500;
            color: #3c4043;
            margin-bottom: 4px;
            word-break: break-word;
        }
        
        .link-url {
            font-size: 12px;
            color: #5f6368;
            font-family: monospace;
            word-break: break-all;
        }
        
        .link-invalid {
            opacity: 0.6;
        }
        
        .link-invalid .link-text {
            color: #d93025;
        }
        
        .invalid-badge {
            background: #fce8e6;
            color: #d93025;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            margin-left: 8px;
        }
        
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .select-controls {
            display: flex;
            gap: 10px;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        
        .btn-secondary {
            background: #f8f9fa;
            color: #3c4043;
            border: 1px solid #dadce0;
        }
        
        .btn-secondary:hover {
            background: #e8eaed;
        }
        
        .action-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            padding-top: 15px;
            border-top: 1px solid #dadce0;
        }
        
        .btn-primary {
            background: #1a73e8;
            color: white;
            padding: 12px 24px;
            font-size: 16px;
        }
        
        .btn-primary:hover {
            background: #1557b0;
        }
        
        .btn-primary:disabled {
            background: #dadce0;
            color: #9aa0a6;
            cursor: not-allowed;
        }
        
        .btn-cancel {
            background: #f8f9fa;
            color: #3c4043;
            border: 1px solid #dadce0;
            padding: 12px 24px;
            font-size: 16px;
        }
        
        .btn-cancel:hover {
            background: #e8eaed;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            color: #5f6368;
        }
        
        .success-message {
            background: #e6f4ea;
            color: #137333;
            padding: 12px;
            border-radius: 5px;
            margin-top: 15px;
            text-align: center;
        }
        
        .error-message {
            background: #fce8e6;
            color: #d93025;
            padding: 12px;
            border-radius: 5px;
            margin-top: 15px;
            text-align: center;
        }
        
        .preview-mode .link-checkbox {
            display: none;
        }
        
        .preview-mode .action-buttons .btn-primary {
            display: none;
        }
        
        .note {
            background: #fff3cd;
            color: #856404;
            padding: 8px 12px;
            border-radius: 4px;
            margin-bottom: 15px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 id="title">Open All Links</h2>
        </div>
        
        <div class="stats" id="stats">
            Loading links...
        </div>
        
        <div class="controls" id="controls" style="display: none;">
            <div class="select-controls">
                <button class="btn btn-secondary" onclick="selectAll()">Select All</button>
                <button class="btn btn-secondary" onclick="selectNone()">Select None</button>
                <button class="btn btn-secondary" onclick="selectValid()">Select Valid Only</button>
            </div>
        </div>
        
        <div class="note" id="note" style="display: none;">
            <strong>⚠️ Important:</strong> To open multiple links, you must <strong>allow popups for script.google.com</strong> in your browser settings. 
        </div>
        
        <div class="link-list" id="linkList">
            <div class="loading">Loading links...</div>
        </div>
        
        <div class="action-buttons">
            <button class="btn btn-primary" onclick="openSelectedLinks()" id="openBtn" style="display: none;">
                Open Selected Links
            </button>
            <button class="btn btn-secondary" onclick="testLinkOpening()" id="testBtn" style="display: none;">
                Test (Open First Link Only)
            </button>
            <button class="btn btn-cancel" onclick="goBack()">
                Back to Search
            </button>
        </div>
        
        <div id="message"></div>
    </div>

    <script>
        // The data is injected directly here
        const DIALOG_DATA = ${JSON.stringify(dialogData)};
        
        // Global variables
        let linksData = [];
        let isPreviewMode = false;
        
        // Initialize the dialog
        document.addEventListener('DOMContentLoaded', function() {
            initializeDialog(DIALOG_DATA);
        });
        
        // Initialize dialog with data
        function initializeDialog(data) {
            try {
                linksData = data.links || [];
                isPreviewMode = data.mode === 'preview';
                
                // Update title
                document.getElementById('title').textContent = 
                    isPreviewMode ? 'Links Found in Document' : 'Open All Links';
                
                // Update stats
                const invalidCount = linksData.filter(link => !link.isValid).length;
                const statsText = \`Found \${linksData.length} link\${linksData.length !== 1 ? 's' : ''} in document\` +
                    (invalidCount > 0 ? \` (\${invalidCount} invalid)\` : '');
                document.getElementById('stats').textContent = statsText;
                
                // Show controls if not preview mode
                if (!isPreviewMode) {
                    document.getElementById('controls').style.display = 'flex';
                    document.getElementById('note').style.display = 'block';
                    document.getElementById('openBtn').style.display = 'inline-block';
                    document.getElementById('testBtn').style.display = 'inline-block';
                } else {
                    document.getElementById('linkList').style.maxHeight = '520px';
                }
                
                // Render links
                renderLinks();
                
                // Update button state
                updateOpenButton();
            } catch (error) {
                console.error('Error initializing dialog:', error);
                showMessage('Error loading dialog: ' + error.message, 'error');
            }
        }
        
        // Render links in the list
        function renderLinks() {
            const linkList = document.getElementById('linkList');
            linkList.innerHTML = '';
            
            if (linksData.length === 0) {
                linkList.innerHTML = '<div class="loading">No links found in document.</div>';
                return;
            }
            
            linksData.forEach((link, index) => {
                const linkItem = document.createElement('div');
                linkItem.className = 'link-item' + (!link.isValid ? ' link-invalid' : '');
                
                let html = '';
                
                if (!isPreviewMode) {
                    html += \`<input type="checkbox" class="link-checkbox" 
                                   data-url="\${escapeHtml(link.url)}" 
                                   \${link.isValid ? 'checked' : ''}>\`;
                }
                
                html += \`
                    <div class="link-content">
                        <div class="link-text">
                            \${escapeHtml(link.text)}
                            \${!link.isValid ? '<span class="invalid-badge">Invalid</span>' : ''}
                        </div>
                        <div class="link-url">\${escapeHtml(link.url)}</div>
                    </div>
                \`;
                
                linkItem.innerHTML = html;
                linkList.appendChild(linkItem);
                
                // Add event listener to checkbox
                const checkbox = linkItem.querySelector('.link-checkbox');
                if (checkbox) {
                    checkbox.addEventListener('change', updateOpenButton);
                }
            });
        }
        
        // Escape HTML to prevent XSS
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Select all checkboxes
        function selectAll() {
            const checkboxes = document.querySelectorAll('.link-checkbox');
            checkboxes.forEach(cb => cb.checked = true);
            updateOpenButton();
        }
        
        // Deselect all checkboxes
        function selectNone() {
            const checkboxes = document.querySelectorAll('.link-checkbox');
            checkboxes.forEach(cb => cb.checked = false);
            updateOpenButton();
        }
        
        // Select only valid links
        function selectValid() {
            const checkboxes = document.querySelectorAll('.link-checkbox');
            checkboxes.forEach(cb => {
                const linkItem = cb.closest('.link-item');
                cb.checked = !linkItem.classList.contains('link-invalid');
            });
            updateOpenButton();
        }
        
        // Update the open button state
        function updateOpenButton() {
            const openBtn = document.getElementById('openBtn');
            if (openBtn) {
                const checkedBoxes = document.querySelectorAll('.link-checkbox:checked');
                openBtn.disabled = checkedBoxes.length === 0;
            }
        }
        
        // Test function to open just the first selected link
        function testLinkOpening() {
            const checkboxes = document.querySelectorAll('.link-checkbox:checked');
            
            if (checkboxes.length === 0) {
                showMessage('Please select at least one link to test.', 'error');
                return;
            }
            
            const firstUrl = checkboxes[0].dataset.url;
            showMessage(\`Testing link: \${firstUrl}\`, 'loading');
            
            try {
                const newWindow = window.open(firstUrl, '_blank', 'noopener,noreferrer');
                if (newWindow) {
                    showMessage('Test link opened successfully!', 'success');
                } else {
                    showMessage('Popup was blocked. Please allow popups for this site.', 'error');
                }
            } catch (error) {
                console.error('Test failed:', error);
                showMessage('Test failed: ' + error.message, 'error');
            }
        }
        
        // Open selected links
        function openSelectedLinks() {
            const selectedUrls = [];
            const checkboxes = document.querySelectorAll('.link-checkbox:checked');
            
            checkboxes.forEach(cb => {
                selectedUrls.push(cb.dataset.url);
            });
            
            if (selectedUrls.length === 0) {
                showMessage('Please select at least one link to open.', 'error');
                return;
            }
            
            showMessage(\`Opening \${selectedUrls.length} link\${selectedUrls.length > 1 ? 's' : ''}...\`, 'loading');
            
            // Open all links immediately to preserve user gesture
            let successCount = 0;
            let failCount = 0;
            
            selectedUrls.forEach((url, index) => {
                try {
                    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                    if (newWindow) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (error) {
                    console.error('Failed to open link:', url, error);
                    failCount++;
                }
            });
            
            // Show results
            const message = failCount === 0 
                ? \`Successfully opened \${successCount} link\${successCount > 1 ? 's' : ''}!\`
                : \`Opened \${successCount} link\${successCount > 1 ? 's' : ''}, \${failCount} failed. Check popup settings.\`;
            
            showMessage(message, failCount === 0 ? 'success' : 'error');
        }
        
        // Show message to user
        function showMessage(message, type) {
            const messageDiv = document.getElementById('message');
            let className = '';
            
            switch (type) {
                case 'success':
                    className = 'success-message';
                    break;
                case 'error':
                    className = 'error-message';
                    break;
                case 'loading':
                    className = 'loading';
                    break;
            }
            
            messageDiv.innerHTML = \`<div class="\${className}">\${message}</div>\`;
        }
        
        // Go back to the main page
        function goBack() {
            const url = window.location.href.split('?')[0];
            window.location.href = url;
        }
    </script>
</body>
</html>`;

  return HtmlService.createHtmlOutput(htmlContent)
    .setWidth(600)
    .setHeight(800);
}