/**
 * Simple Web App for Link Opener - Debugging Version
 * This version includes better error handling and logging
 */

/**
 * Test function - run this directly to test document access
 * Replace the URL with your actual document URL
 */
function testDocumentAccess() {
  const TEST_URL = 'https://docs.google.com/document/d/1qusEM887WxusJZpjGIWEYDc09ynPNh_mlSb3H6lFJO0/edit';
  
  try {
    console.log('Testing document access...');
    console.log('Test URL:', TEST_URL);
    
    // Test both URL and ID access
    const doc = DocumentApp.openByUrl(TEST_URL);
    console.log('✅ Document opened by URL successfully');
    console.log('Document name:', doc.getName());
    
    // Test with just the ID
    const DOC_ID = '1qusEM887WxusJZpjGIWEYDc09ynPNh_mlSb3H6lFJO0';
    const doc2 = DocumentApp.openById(DOC_ID);
    console.log('✅ Document opened by ID successfully');
    
    const links = extractAllLinksFromDocument(doc);
    console.log('✅ Found', links.length, 'links');
    
    links.forEach((link, index) => {
      console.log(`${index + 1}. ${link.text} -> ${link.url}`);
    });
    
    return `Success! Found ${links.length} links.`;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    return `Error: ${error.message}`;
  }
}

/**
 * Test the doGet function directly with simulated parameters
 */
function testDoGetDirectly() {
  console.log('Testing doGet function directly...');
  
  // Simulate the event object that doGet receives
  const mockEvent = {
    parameter: {
      docUrl: 'https://docs.google.com/document/d/1qusEM887WxusJZpjGIWEYDc09ynPNh_mlSb3H6lFJO0/edit'
    }
  };
  
  try {
    const result = doGet(mockEvent);
    console.log('✅ doGet executed successfully');
    console.log('Result type:', typeof result);
    console.log('Result has getContent:', typeof result.getContent === 'function');
    return 'doGet test completed - check logs for details';
  } catch (error) {
    console.error('❌ doGet test failed:', error);
    return `doGet test failed: ${error.message}`;
  }
}

function doGet(e) {
  console.log('doGet called with parameters:', JSON.stringify(e.parameter));
  console.log('Full event object:', JSON.stringify(e));
  
  const documentId = e.parameter.docId;
  const documentUrl = e.parameter.docUrl;
  
  console.log('Extracted documentId:', documentId);
  console.log('Extracted documentUrl:', documentUrl);
  
  if (documentId || documentUrl) {
    console.log('Processing document:', documentId || documentUrl);
    try {
      return processDocumentForWebApp(documentId, documentUrl);
    } catch (error) {
      console.error('Error in doGet processing:', error);
      return createErrorPage('Error in doGet: ' + error.message, documentId || documentUrl);
    }
  }
  
  console.log('No document parameters found, showing input form');
  // Show input form
  return createInputForm();
}

function createInputForm() {
  const html = `<!DOCTYPE html>
<html>
<head>
    <title>Link Opener - Debug</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .loading { text-align: center; color: #666; margin: 20px 0; }
        .error { background: #fce8e6; color: #d93025; padding: 15px; border-radius: 4px; margin: 15px 0; }
    </style>
</head>
<body>
    <h1>Google Docs Link Opener (Debug)</h1>
    
    <form id="docForm">
        <div class="form-group">
            <label for="docInput">Document URL or ID:</label>
            <input type="text" id="docInput" placeholder="Paste Google Docs URL or Document ID here">
        </div>
        <button type="button" onclick="processDocument()">Extract Links</button>
    </form>
    
    <div id="loading" class="loading" style="display: none;">Processing...</div>
    <div id="error" class="error" style="display: none;"></div>
    
    <script>
        function processDocument() {
            const input = document.getElementById('docInput').value.trim();
            if (!input) {
                showError('Please enter a document URL or ID');
                return;
            }
            
            console.log('Processing input:', input);
            showLoading(true);
            
            // Build the URL
            const baseUrl = window.location.href.split('?')[0];
            let targetUrl;
            
            if (input.includes('docs.google.com')) {
                targetUrl = baseUrl + '?docUrl=' + encodeURIComponent(input);
            } else {
                targetUrl = baseUrl + '?docId=' + encodeURIComponent(input);
            }
            
            console.log('Redirecting to:', targetUrl);
            window.location.href = targetUrl;
        }
        
        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
            document.getElementById('error').style.display = 'none';
        }
        
        function showError(message) {
            document.getElementById('error').textContent = message;
            document.getElementById('error').style.display = 'block';
            document.getElementById('loading').style.display = 'none';
        }
        
        document.getElementById('docInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                processDocument();
            }
        });
    </script>
</body>
</html>`;

  return HtmlService.createHtmlOutput(html).setTitle('Link Opener - Debug');
}

function processDocumentForWebApp(documentId, documentUrl) {
  console.log('processDocumentForWebApp called with:', { documentId, documentUrl });
  
  try {
    let doc;
    let docInfo = '';
    
    if (documentUrl) {
      console.log('Opening by URL:', documentUrl);
      // Clean the URL - remove edit parameters that might cause issues
      let cleanUrl = documentUrl;
      if (cleanUrl.includes('?')) {
        cleanUrl = cleanUrl.split('?')[0];
      }
      if (cleanUrl.includes('#')) {
        cleanUrl = cleanUrl.split('#')[0];
      }
      console.log('Cleaned URL:', cleanUrl);
      
      doc = DocumentApp.openByUrl(cleanUrl);
      docInfo = documentUrl;
    } else if (documentId) {
      console.log('Opening by ID:', documentId);
      doc = DocumentApp.openById(documentId);
      docInfo = documentId;
    } else {
      throw new Error('No document ID or URL provided');
    }
    
    console.log('Document opened successfully');
    console.log('Document name:', doc.getName());
    
    const links = extractAllLinksFromDocument(doc);
    console.log('Found links:', links.length);
    
    if (links.length === 0) {
      return createNoLinksPage(docInfo);
    }
    
    return createLinksPage(links, docInfo);
    
  } catch (error) {
    console.error('Error in processDocumentForWebApp:', error);
    console.error('Error stack:', error.stack);
    return createErrorPage(error.message, documentId || documentUrl);
  }
}

function createNoLinksPage(docInfo) {
  const html = `<!DOCTYPE html>
<html>
<head>
    <title>No Links Found</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
        button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <h2>No Links Found</h2>
    <p>No hyperlinks were found in the document:</p>
    <p><small>${docInfo}</small></p>
    <button onclick="goBack()">Try Another Document</button>
    
    <script>
        function goBack() {
            window.location.href = window.location.href.split('?')[0];
        }
    </script>
</body>
</html>`;

  return HtmlService.createHtmlOutput(html).setTitle('No Links Found');
}

function createErrorPage(errorMessage, docInfo) {
  const html = `<!DOCTYPE html>
<html>
<head>
    <title>Error</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .error { background: #fce8e6; color: #d93025; padding: 15px; border-radius: 5px; margin: 20px 0; }
        button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <h2>Error Processing Document</h2>
    <div class="error">
        <strong>Error:</strong> ${errorMessage}
    </div>
    <p><strong>Document:</strong> ${docInfo || 'Unknown'}</p>
    
    <h3>Common Solutions:</h3>
    <ul>
        <li>Make sure you have <strong>edit access</strong> to the document</li>
        <li>Check that the URL or ID is correct</li>
        <li>Ensure the document exists and is accessible</li>
        <li>Try copying the URL from the address bar when viewing the document</li>
    </ul>
    
    <button onclick="goBack()">Try Again</button>
    
    <script>
        function goBack() {
            window.location.href = window.location.href.split('?')[0];
        }
    </script>
</body>
</html>`;

  return HtmlService.createHtmlOutput(html).setTitle('Error');
}

function createLinksPage(links, docInfo) {
  console.log('Creating links page with', links.length, 'links');
  
  const validCount = links.filter(link => link.isValid).length;
  const invalidCount = links.length - validCount;
  
  const html = `<!DOCTYPE html>
<html>
<head>
    <title>Links Found</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .stats { background: #e8f0fe; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .link-item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .link-text { font-weight: bold; margin-bottom: 5px; }
        .link-url { color: #666; font-family: monospace; word-break: break-all; }
        .invalid { opacity: 0.6; background: #ffeaea; }
        .controls { margin: 20px 0; text-align: center; }
        button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .secondary { background: #f8f9fa; color: #333; border: 1px solid #ddd; }
        .message { margin: 20px 0; padding: 15px; border-radius: 5px; text-align: center; }
        .success { background: #e6f4ea; color: #137333; }
        .error { background: #fce8e6; color: #d93025; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Links Found in Document</h1>
        
        <div class="stats">
            Found <strong>${links.length}</strong> links 
            (${validCount} valid${invalidCount > 0 ? ', ' + invalidCount + ' invalid' : ''})
        </div>
        
        <div class="controls">
            <button onclick="openAllValid()">Open All Valid Links</button>
            <button onclick="openSelected()" id="openSelected" style="display: none;">Open Selected</button>
            <button class="secondary" onclick="selectAll()">Select All</button>
            <button class="secondary" onclick="selectNone()">Clear All</button>
            <button class="secondary" onclick="goBack()">Back</button>
        </div>
        
        <div id="message"></div>
        
        <div class="links">
            ${links.map((link, index) => `
                <div class="link-item ${link.isValid ? '' : 'invalid'}">
                    <input type="checkbox" id="link_${index}" ${link.isValid ? 'checked' : ''} onchange="updateButtons()">
                    <label for="link_${index}">
                        <div class="link-text">${escapeHtml(link.text)} ${link.isValid ? '' : '(Invalid)'}</div>
                        <div class="link-url">${escapeHtml(link.url)}</div>
                    </label>
                </div>
            `).join('')}
        </div>
    </div>
    
    <script>
        const links = ${JSON.stringify(links)};
        
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
            const validLinks = links.filter(link => link.isValid);
            openLinks(validLinks.map(link => link.url));
        }
        
        function openSelected() {
            const urls = [];
            document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
                const index = cb.id.split('_')[1];
                urls.push(links[index].url);
            });
            openLinks(urls);
        }
        
        function openLinks(urls) {
            if (urls.length === 0) {
                showMessage('No links selected', 'error');
                return;
            }
            
            showMessage('Opening ' + urls.length + ' links...', 'info');
            
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
        
        function showMessage(text, type) {
            const msg = document.getElementById('message');
            msg.textContent = text;
            msg.className = 'message ' + type;
        }
        
        function goBack() {
            window.location.href = window.location.href.split('?')[0];
        }
        
        updateButtons();
    </script>
</body>
</html>`;

  return HtmlService.createHtmlOutput(html)
    .setTitle('Links Found')
    .setWidth(800)
    .setHeight(600);
}

// Copy of the required functions from Code.gs
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