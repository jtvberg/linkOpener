/**
 * Minimal Web App for Google Docs Link Extraction
 * This version should deploy without issues
 */

function doGet(e) {
  return createMainPage();
}

function createMainPage() {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <base target="_top">
    <title>Google Docs Link Opener</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        input[type="text"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin: 10px 0; }
        button { background: #4285f4; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #3367d6; }
        .message { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .loading { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .link-item { margin: 10px 0; padding: 10px; border: 1px solid #eee; border-radius: 4px; }
        .link-text { font-weight: bold; }
        .link-url { color: #666; font-size: 0.9em; word-break: break-all; }
        #linksSection { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Google Docs Link Opener</h1>
        <p>Extract and open all hyperlinks from any Google Document</p>
        
        <div>
            <label for="docInput">Google Doc URL or ID:</label>
            <input type="text" id="docInput" placeholder="https://docs.google.com/document/d/YOUR_DOC_ID/edit or just the document ID">
            <button onclick="extractLinks()">Extract Links</button>
        </div>
        
        <div id="message"></div>
        
        <div id="linksSection">
            <h3>Found Links:</h3>
            <div>
                <button onclick="selectAll()">Select All</button>
                <button onclick="selectNone()">Select None</button>
                <button id="openSelected" onclick="openSelected()" style="display:none;">Open Selected Links</button>
            </div>
            <div id="linksList"></div>
        </div>
    </div>

    <script>
        let foundLinks = [];
        
        function showMessage(text, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.innerHTML = '<div class="' + type + '">' + text + '</div>';
        }
        
        function extractLinks() {
            const input = document.getElementById('docInput').value.trim();
            if (!input) {
                showMessage('Please enter a Google Doc URL or ID', 'error');
                return;
            }
            
            showMessage('Extracting links...', 'loading');
            document.getElementById('linksSection').style.display = 'none';
            
            google.script.run
                .withSuccessHandler(onLinksExtracted)
                .withFailureHandler(onExtractionError)
                .extractLinksFromInput(input);
        }
        
        function onLinksExtracted(links) {
            foundLinks = links;
            
            if (links.length === 0) {
                showMessage('No links found in the document', 'error');
                return;
            }
            
            showMessage('Found ' + links.length + ' links!', 'success');
            
            const linksList = document.getElementById('linksList');
            linksList.innerHTML = links.map((link, index) => 
                '<div class="link-item">' +
                '<input type="checkbox" id="link_' + index + '" checked onchange="updateButtons()">' +
                '<label for="link_' + index + '">' +
                '<div class="link-text">' + escapeHtml(link.text) + '</div>' +
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
        
        function openSelected() {
            const urls = [];
            document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
                const index = parseInt(cb.id.split('_')[1]);
                urls.push(foundLinks[index].url);
            });
            
            if (urls.length === 0) {
                showMessage('No links selected', 'error');
                return;
            }
            
            showMessage('Opening ' + urls.length + ' links...', 'loading');
            
            urls.forEach(url => {
                window.open(url, '_blank');
            });
            
            setTimeout(() => {
                showMessage('Opened ' + urls.length + ' links', 'success');
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
    .setTitle('Google Docs Link Opener')
    .setWidth(800)
    .setHeight(600);
}

function extractLinksFromInput(input) {
  console.log('extractLinksFromInput called with:', input);
  
  try {
    let doc;
    
    if (input.includes('docs.google.com')) {
      console.log('Opening by URL');
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
    throw new Error('Could not access document. Make sure you have access and the URL/ID is correct. Error: ' + error.message);
  }
}

function extractAllLinksFromDocument(doc) {
  const links = [];
  const body = doc.getBody();
  
  function processElement(element) {
    if (element.getType() === DocumentApp.ElementType.TEXT) {
      const textElement = element.asText();
      const text = textElement.getText();
      
      for (let i = 0; i < text.length; i++) {
        const url = textElement.getLinkUrl(i);
        if (url) {
          let linkText = '';
          let j = i;
          while (j < text.length && textElement.getLinkUrl(j) === url) {
            linkText += text.charAt(j);
            j++;
          }
          
          links.push({
            text: linkText.trim(),
            url: url,
            isValid: isValidUrl(url)
          });
          
          i = j - 1;
        }
      }
    }
    
    if (element.getNumChildren) {
      for (let i = 0; i < element.getNumChildren(); i++) {
        processElement(element.getChild(i));
      }
    }
  }
  
  processElement(body);
  
  // Remove duplicates
  const seen = new Set();
  return links.filter(link => {
    const key = link.url + '|' + link.text;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
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