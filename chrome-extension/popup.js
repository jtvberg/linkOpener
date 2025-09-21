// Popup script for the Chrome extension
document.addEventListener('DOMContentLoaded', function() {
  const extractButton = document.getElementById('extractLinks');
  const statusDiv = document.getElementById('status');

  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
  }

  extractButton.addEventListener('click', async function() {
    try {
      extractButton.disabled = true;
      showStatus('Checking current tab...', 'info');

      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('docs.google.com/document/')) {
        showStatus('Please navigate to a Google Docs document first.', 'error');
        extractButton.disabled = false;
        return;
      }

      showStatus('Extracting links...', 'info');

      // Execute the link extraction in the content script
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: triggerLinkExtraction
      });

      if (results[0].result) {
        showStatus(`Found ${results[0].result} links!`, 'success');
        // Close the popup after a short delay
        setTimeout(() => window.close(), 1500);
      } else {
        showStatus('No links found in the document.', 'info');
      }

    } catch (error) {
      console.error('Error:', error);
      showStatus('Error: ' + error.message, 'error');
    } finally {
      extractButton.disabled = false;
    }
  });
});

// Function that will be injected into the page
function triggerLinkExtraction() {
  // Check if the link opener is available
  if (window.linkOpener && typeof window.linkOpener.showLinkDialog === 'function') {
    window.linkOpener.showLinkDialog();
    return window.linkOpener.links.length;
  } else if (window.linkOpener && typeof window.linkOpener.extractLinks === 'function') {
    const links = window.linkOpener.extractLinks();
    window.linkOpener.showLinkDialog();
    return links.length;
  } else {
    // Try to trigger the button click
    const button = document.getElementById('link-opener-btn');
    if (button) {
      button.click();
      return 1; // Return 1 to indicate success
    }
    
    // Fallback: create a temporary link opener
    const linkOpener = new (function() {
      this.extractLinks = function() {
        const links = [];
        const visited = new Set();

        // Get all links in the document
        const linkElements = document.querySelectorAll('a[href]');
        
        linkElements.forEach(link => {
          const href = link.getAttribute('href');
          const text = link.textContent.trim();
          
          if (href && text && !visited.has(href + '|' + text)) {
            visited.add(href + '|' + text);
            links.push({
              text: text,
              url: href,
              isValid: this.isValidUrl(href)
            });
          }
        });

        return links;
      };

      this.isValidUrl = function(url) {
        if (!url || typeof url !== 'string') return false;
        return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:');
      };

      this.openLinks = function(urls) {
        urls.forEach((url, index) => {
          setTimeout(() => {
            window.open(url, '_blank');
          }, index * 100);
        });
      };

      this.showLinkDialog = function() {
        const links = this.extractLinks();
        
        if (links.length === 0) {
          alert('No links found in this document.');
          return;
        }

        const validLinks = links.filter(link => link.isValid);
        const message = `Found ${links.length} links (${validLinks.length} valid).\n\nOpen all valid links?`;
        
        if (confirm(message)) {
          this.openLinks(validLinks.map(link => link.url));
        }
      };
    })();

    linkOpener.showLinkDialog();
    return linkOpener.extractLinks().length;
  }
}