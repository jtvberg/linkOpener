// Google Docs Link Opener - Content Script
// This script runs on Google Docs pages and adds the link opening functionality

class GoogleDocsLinkOpener {
  constructor() {
    this.links = [];
    this.isDocumentReady = false;
    this.init();
  }

  init() {
    // Wait for the document to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Wait for Google Docs to load
    this.waitForGoogleDocs().then(() => {
      this.addControlButton();
      this.isDocumentReady = true;
    });
  }

  async waitForGoogleDocs() {
    // Wait for the Google Docs editor to be present
    return new Promise((resolve) => {
      const checkForEditor = () => {
        const editor = document.querySelector('.kix-page');
        if (editor) {
          resolve();
        } else {
          setTimeout(checkForEditor, 500);
        }
      };
      checkForEditor();
    });
  }

  addControlButton() {
    // Create the link opener button in the Google Docs toolbar
    const toolbar = document.querySelector('.docs-material-gm-toolbar-strip') || 
                   document.querySelector('.docs-toolbar-wrapper');
    
    if (!toolbar) {
      console.log('Could not find Google Docs toolbar');
      return;
    }

    // Check if button already exists
    if (document.getElementById('link-opener-btn')) {
      return;
    }

    const button = document.createElement('div');
    button.id = 'link-opener-btn';
    button.className = 'link-opener-button';
    button.innerHTML = `
      <button type="button" title="Open all links in document">
        🔗 Open Links
      </button>
    `;

    button.addEventListener('click', () => this.showLinkDialog());
    
    // Insert the button into the toolbar
    toolbar.appendChild(button);
  }

  extractLinks() {
    this.links = [];
    const visited = new Set();

    // Get all text elements in the document
    const textElements = document.querySelectorAll('.kix-page *');
    
    textElements.forEach(element => {
      // Look for links in the element's attributes and content
      const links = element.querySelectorAll('a[href]');
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        
        if (href && text && !visited.has(href + '|' + text)) {
          visited.add(href + '|' + text);
          this.links.push({
            text: text,
            url: href,
            isValid: this.isValidUrl(href)
          });
        }
      });

      // Also check for Google Docs internal link format
      if (element.hasAttribute('data-link-url')) {
        const href = element.getAttribute('data-link-url');
        const text = element.textContent.trim();
        
        if (href && text && !visited.has(href + '|' + text)) {
          visited.add(href + '|' + text);
          this.links.push({
            text: text,
            url: href,
            isValid: this.isValidUrl(href)
          });
        }
      }
    });

    // Alternative method: Look for Google Docs specific link patterns
    this.extractFromDocumentText();

    return this.links;
  }

  extractFromDocumentText() {
    // This method tries to extract links using Google Docs API approach
    // but adapted for the browser DOM
    try {
      const pageElements = document.querySelectorAll('.kix-page');
      
      pageElements.forEach(page => {
        const walker = document.createTreeWalker(
          page,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        let node;
        while (node = walker.nextNode()) {
          const parent = node.parentElement;
          if (parent && parent.hasAttribute('data-link-url')) {
            const href = parent.getAttribute('data-link-url');
            const text = node.textContent.trim();
            
            if (href && text) {
              const linkKey = href + '|' + text;
              if (!this.links.some(link => (link.url + '|' + link.text) === linkKey)) {
                this.links.push({
                  text: text,
                  url: href,
                  isValid: this.isValidUrl(href)
                });
              }
            }
          }
        }
      });
    } catch (error) {
      console.log('Alternative link extraction failed:', error);
    }
  }

  isValidUrl(url) {
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

  showLinkDialog() {
    const links = this.extractLinks();
    
    if (links.length === 0) {
      alert('No links found in this document.');
      return;
    }

    // Create modal dialog
    this.createLinkModal(links);
  }

  createLinkModal(links) {
    // Remove existing modal if present
    const existingModal = document.getElementById('link-opener-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'link-opener-modal';
    modal.className = 'link-opener-modal';
    
    modal.innerHTML = `
      <div class="link-opener-modal-content">
        <div class="link-opener-header">
          <h3>Found ${links.length} Links</h3>
          <button class="link-opener-close">&times;</button>
        </div>
        
        <div class="link-opener-controls">
          <button id="open-all-valid" class="link-opener-btn-primary">
            Open All Valid Links (${links.filter(l => l.isValid).length})
          </button>
          <button id="open-selected" class="link-opener-btn-secondary" style="display: none;">
            Open Selected
          </button>
          <button id="select-all" class="link-opener-btn-secondary">Select All</button>
          <button id="select-none" class="link-opener-btn-secondary">Clear All</button>
        </div>
        
        <div class="link-opener-list">
          ${links.map((link, index) => `
            <div class="link-opener-item">
              <input type="checkbox" id="link_${index}" ${link.isValid ? 'checked' : ''}>
              <label for="link_${index}">
                <div class="link-text">${this.escapeHtml(link.text)}${link.isValid ? '' : ' (Invalid)'}</div>
                <div class="link-url">${this.escapeHtml(link.url)}</div>
              </label>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    this.setupModalEvents(modal, links);
  }

  setupModalEvents(modal, links) {
    // Close modal
    modal.querySelector('.link-opener-close').addEventListener('click', () => {
      modal.remove();
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Open all valid links
    modal.querySelector('#open-all-valid').addEventListener('click', () => {
      const validLinks = links.filter(link => link.isValid);
      this.openLinks(validLinks.map(link => link.url));
    });

    // Open selected links
    modal.querySelector('#open-selected').addEventListener('click', () => {
      const selectedUrls = [];
      modal.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        const index = parseInt(checkbox.id.split('_')[1]);
        selectedUrls.push(links[index].url);
      });
      this.openLinks(selectedUrls);
    });

    // Select all
    modal.querySelector('#select-all').addEventListener('click', () => {
      modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
      this.updateSelectedButton(modal);
    });

    // Clear all
    modal.querySelector('#select-none').addEventListener('click', () => {
      modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      this.updateSelectedButton(modal);
    });

    // Update selected button visibility
    modal.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.updateSelectedButton(modal));
    });

    this.updateSelectedButton(modal);
  }

  updateSelectedButton(modal) {
    const checkedCount = modal.querySelectorAll('input[type="checkbox"]:checked').length;
    const selectedBtn = modal.querySelector('#open-selected');
    selectedBtn.style.display = checkedCount > 0 ? 'inline-block' : 'none';
    selectedBtn.textContent = `Open Selected (${checkedCount})`;
  }

  openLinks(urls) {
    if (urls.length === 0) {
      alert('No links selected.');
      return;
    }

    let opened = 0;
    const delay = 100; // Delay between opening links to prevent browser blocking

    urls.forEach((url, index) => {
      setTimeout(() => {
        try {
          window.open(url, '_blank');
          opened++;
          
          // Show completion message after last link
          if (index === urls.length - 1) {
            setTimeout(() => {
              alert(`Opened ${opened} out of ${urls.length} links.`);
            }, 500);
          }
        } catch (error) {
          console.error('Failed to open link:', url, error);
        }
      }, index * delay);
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the link opener when the script loads
let linkOpener;

// Wait a bit for Google Docs to fully load
setTimeout(() => {
  linkOpener = new GoogleDocsLinkOpener();
}, 1000);

// Also listen for navigation changes in single-page apps
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Reinitialize on navigation
    setTimeout(() => {
      if (!document.getElementById('link-opener-btn')) {
        linkOpener = new GoogleDocsLinkOpener();
      }
    }, 2000);
  }
}).observe(document, { subtree: true, childList: true });