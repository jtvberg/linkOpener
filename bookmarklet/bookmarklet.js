/**
 * Google Docs Link Opener Bookmarklet - Web App Version
 * 
 * This simplified bookmarklet calls your Google Apps Script web app
 * instead of trying to extract links directly from the Google Docs DOM.
 * 
 * To use this bookmarklet:
 * 1. Copy the minified code from bookmarklet-min.js
 * 2. Create a new bookmark in your browser
 * 3. Set the URL to: javascript:(paste the minified code here)
 * 4. Name it "Open Google Docs Links"
 * 5. Click the bookmark when viewing a Google Doc
 */

(function() {
  'use strict';
  
  // Check if we're on a Google Docs page
  if (!window.location.href.includes('docs.google.com/document/')) {
    alert('This bookmarklet only works on Google Docs pages. Please navigate to a Google Doc and try again.');
    return;
  }

  // Extract document ID from URL
  const urlMatch = window.location.href.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (!urlMatch) {
    alert('Could not extract document ID from URL');
    return;
  }
  
  const docId = urlMatch[1];
  const docUrl = window.location.href.split('?')[0].split('#')[0]; // Clean URL
  
  console.log('Document ID:', docId);
  console.log('Document URL:', docUrl);
  
  // Get web app URL from localStorage or prompt user
  let webAppUrl = localStorage.getItem('linkOpenerWebAppUrl');
  if (!webAppUrl) {
    webAppUrl = prompt(
      'Enter your Google Apps Script web app URL:',
      'https://script.google.com/macros/s/AKfycbxuiEOMFZAkakxfgUYGGXTMvSLqfvyEFfYgF5IWacGC8d31OKVpJOJtAzCmQEV-H6vzsw/exec'
    );
    if (!webAppUrl) {
      alert('Please provide a valid web app URL');
      return;
    }
    
    // Save for future use
    localStorage.setItem('linkOpenerWebAppUrl', webAppUrl);
  }
  
  console.log('Opening web app with document URL...');
  
  // Open web app with document URL as parameter
  const webAppWithParams = webAppUrl + '?docUrl=' + encodeURIComponent(docUrl);
  window.open(webAppWithParams, 'linkOpener', 'width=900,height=700,scrollbars=yes,resizable=yes');

  class GoogleDocsLinkOpenerBookmarklet {
    constructor() {
      this.links = [];
      this.modalId = 'gd-link-opener-modal';
      this.init();
    }

    init() {
      this.extractLinks();
      this.showDialog();
    }

    extractLinks() {
      this.links = [];
      const visited = new Set();

      try {
        // Method 1: Extract from Google Docs internal data structures
        this.extractFromDocsInternals();

        // Method 2: Extract from rendered document elements
        this.extractFromDocsCanvas();

        // Method 3: Extract from accessibility tree
        this.extractFromAccessibilityTree();

        // Method 4: Fallback - extract from any visible links (filter out UI links)
        this.extractVisibleDocumentLinks();

      } catch (error) {
        console.log('Link extraction error:', error);
      }

      // If we still don't have many links, try using the web app API
      if (this.links.length === 0) {
        this.tryWebAppExtraction();
      }
      
      // Remove duplicates
      const uniqueLinks = [];
      const seen = new Set();
      
      this.links.forEach(link => {
        const key = link.url + '|' + link.text;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueLinks.push(link);
        }
      });
      
      this.links = uniqueLinks;
      console.log(`Found ${this.links.length} unique links`);
    }

    extractFromDocsInternals() {
      // Try to access Google Docs internal data structures
      try {
        // Look for Google Docs app data
        if (window.docs && window.docs.model) {
          console.log('Found Google Docs model data');
          // This would require reverse engineering Google's internal structure
        }

        // Check for any global variables that might contain document data
        const possibleDataVars = ['_docs_flag_initialData', 'DOCS_modelChunk', 'DOCS_timing'];
        
        possibleDataVars.forEach(varName => {
          if (window[varName]) {
            console.log(`Found potential data in ${varName}`);
            // Try to extract links from this data
            this.searchObjectForLinks(window[varName]);
          }
        });

        // Look for script tags containing document data
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
          const content = script.textContent;
          if (content && (content.includes('http://') || content.includes('https://'))) {
            this.extractLinksFromText(content);
          }
        });

      } catch (error) {
        console.log('Internal extraction failed:', error);
      }
    }

    searchObjectForLinks(obj, depth = 0) {
      if (depth > 5 || !obj || typeof obj !== 'object') return;
      
      try {
        if (Array.isArray(obj)) {
          obj.forEach(item => this.searchObjectForLinks(item, depth + 1));
        } else {
          Object.values(obj).forEach(value => {
            if (typeof value === 'string' && this.isValidUrl(value)) {
              this.links.push({
                text: this.findTextForUrl(value) || value,
                url: value,
                isValid: true
              });
            } else if (typeof value === 'object') {
              this.searchObjectForLinks(value, depth + 1);
            }
          });
        }
      } catch (error) {
        // Ignore errors from accessing restricted properties
      }
    }

    findTextForUrl(url) {
      // Try to find associated text for a URL by looking in the same data structure
      // This is a simplified approach - in practice would need more sophisticated logic
      return url.length > 50 ? url.substring(0, 47) + '...' : url;
    }

    extractLinksFromText(text) {
      // Extract URLs from text content using regex
      const urlRegex = /https?:\/\/[^\s"',;)}\]]+/g;
      const matches = text.match(urlRegex);
      
      if (matches) {
        matches.forEach(url => {
          // Clean up the URL (remove trailing punctuation)
          const cleanUrl = url.replace(/[.,;:!?)"'\]}]*$/, '');
          if (this.isValidUrl(cleanUrl)) {
            this.links.push({
              text: this.extractContextText(text, url) || cleanUrl,
              url: cleanUrl,
              isValid: true
            });
          }
        });
      }
    }

    extractContextText(text, url) {
      // Try to extract meaningful text around the URL
      const index = text.indexOf(url);
      if (index === -1) return null;
      
      const before = text.substring(Math.max(0, index - 30), index).trim();
      const after = text.substring(index + url.length, index + url.length + 30).trim();
      
      // Look for text that might be link text
      const beforeWords = before.split(/\s+/).slice(-3);
      const afterWords = after.split(/\s+/).slice(0, 3);
      
      const contextText = [...beforeWords, ...afterWords].join(' ').trim();
      return contextText || null;
    }

    extractFromDocsCanvas() {
      // Method 1: Look for Google Docs specific link elements and attributes
      const selectors = [
        '[data-link-url]',
        '[linktype]',
        '.kix-lineview-content a',
        '.kix-paragraphrenderer a',
        '.docs-text-background a',
        '[data-docs-text-background] a'
      ];

      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            let href = element.getAttribute('data-link-url') || 
                      element.getAttribute('href') ||
                      element.getAttribute('data-href');
            
            let text = element.textContent.trim() || 
                      element.getAttribute('aria-label') ||
                      element.getAttribute('title');

            if (href && text && this.isValidUrl(href)) {
              this.links.push({
                text: text,
                url: href,
                isValid: true
              });
            }
          });
        } catch (error) {
          console.log(`Selector ${selector} failed:`, error);
        }
      });

      // Method 2: Look for inline styles or CSS that might indicate links
      try {
        const allElements = document.querySelectorAll('.kix-lineview-content *, .kix-paragraphrenderer *');
        allElements.forEach(element => {
          const style = window.getComputedStyle(element);
          const text = element.textContent.trim();
          
          // Look for elements styled like links (blue, underlined, etc.)
          if (text && 
              (style.color === 'rgb(17, 85, 204)' || // Google's link blue
               style.textDecoration.includes('underline') ||
               element.classList.contains('docs-link') ||
               element.getAttribute('role') === 'link')) {
            
            // This element looks like a link, but we need to find the URL
            // Try to find it in parent elements or data attributes
            let parent = element.parentElement;
            let href = null;
            
            while (parent && !href) {
              href = parent.getAttribute('data-link-url') || 
                     parent.getAttribute('href') ||
                     parent.getAttribute('data-href');
              parent = parent.parentElement;
            }
            
            if (href && this.isValidUrl(href)) {
              this.links.push({
                text: text,
                url: href,
                isValid: true
              });
            }
          }
        });
      } catch (error) {
        console.log('Style-based extraction failed:', error);
      }
    }

    extractFromAccessibilityTree() {
      // Use accessibility APIs to find links
      try {
        // Look for elements with link roles
        const linkRoles = document.querySelectorAll('[role="link"]');
        linkRoles.forEach(element => {
          const text = element.textContent.trim() || element.getAttribute('aria-label');
          const href = element.getAttribute('href') || 
                      element.getAttribute('data-href') ||
                      element.getAttribute('data-link-url');
          
          if (href && text && this.isValidUrl(href)) {
            this.links.push({
              text: text,
              url: href,
              isValid: true
            });
          }
        });

        // Look for aria-labels that might contain URLs
        const labeledElements = document.querySelectorAll('[aria-label*="http"]');
        labeledElements.forEach(element => {
          const label = element.getAttribute('aria-label');
          const urlMatch = label.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
            const url = urlMatch[0];
            const text = element.textContent.trim() || label.replace(url, '').trim();
            
            if (this.isValidUrl(url)) {
              this.links.push({
                text: text || url,
                url: url,
                isValid: true
              });
            }
          }
        });

      } catch (error) {
        console.log('Accessibility extraction failed:', error);
      }
    }

    extractVisibleDocumentLinks() {
      // Last resort: extract from visible links but filter out UI elements
      try {
        const allLinks = document.querySelectorAll('a[href]');
        
        allLinks.forEach(link => {
          const href = link.getAttribute('href');
          const text = link.textContent.trim();
          
          // Filter out Google Docs UI links
          if (this.isDocumentLink(link, href, text)) {
            this.links.push({
              text: text,
              url: href,
              isValid: this.isValidUrl(href)
            });
          }
        });
        
      } catch (error) {
        console.log('Visible link extraction failed:', error);
      }
    }

    isDocumentLink(linkElement, href, text) {
      if (!href || !text || !this.isValidUrl(href)) return false;
      
      // Filter out Google Docs UI links
      const uiPatterns = [
        /google\.com\/(docs|drive|accounts)/,
        /support\.google\.com/,
        /policies\.google\.com/,
        /accounts\.google\.com/,
        /myaccount\.google\.com/
      ];
      
      // Check if it's a UI link
      if (uiPatterns.some(pattern => pattern.test(href))) {
        return false;
      }
      
      // Filter out common UI text patterns
      const uiTextPatterns = [
        /^(help|support|learn more|sign in|account|settings|privacy|terms)$/i,
        /^google/i,
        /^docs$/i
      ];
      
      if (uiTextPatterns.some(pattern => pattern.test(text))) {
        return false;
      }
      
      // Check if the link is within the document content area
      const documentSelectors = [
        '.kix-page',
        '.kix-paginateddocumentplugin',
        '.kix-lineview-content',
        '.kix-paragraphrenderer'
      ];
      
      let isInDocument = false;
      let parent = linkElement.parentElement;
      
      while (parent) {
        if (documentSelectors.some(selector => parent.matches && parent.matches(selector))) {
          isInDocument = true;
          break;
        }
        parent = parent.parentElement;
      }
      
      return isInDocument;
    }

    tryWebAppExtraction() {
      // Try to use your existing Google Apps Script web app
      const urlMatch = window.location.href.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      if (!urlMatch) return;
      
      const docId = urlMatch[1];
      console.log('Attempting to use web app for document ID:', docId);
      
      // Show a prompt asking if user wants to use the web app
      if (confirm('No links found using direct extraction. Would you like to open your Google Apps Script web app to extract links? (This will open in a new tab)')) {
        const webAppUrl = prompt('Enter your Google Apps Script web app URL:', 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec');
        
        if (webAppUrl && webAppUrl !== 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
          // Open the web app with the document URL pre-filled
          const docUrl = window.location.href;
          const webAppUrlWithParams = `${webAppUrl}?docUrl=${encodeURIComponent(docUrl)}`;
          window.open(webAppUrlWithParams, '_blank');
        }
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

    showDialog() {
      // Remove existing modal
      const existing = document.getElementById(this.modalId);
      if (existing) existing.remove();

      if (this.links.length === 0) {
        alert('No links found in this Google Document.\\n\\nThis might happen if:\\n- The document has no hyperlinks\\n- The links are not yet loaded\\n- The document is still loading\\n\\nTry waiting a moment and clicking the bookmarklet again.');
        return;
      }

      const modal = this.createModal();
      document.body.appendChild(modal);
      this.setupEventListeners(modal);
    }

    createModal() {
      const modal = document.createElement('div');
      modal.id = this.modalId;
      
      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'gd-modal-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Google Sans', 'Segoe UI', Arial, sans-serif;
      `;
      
      // Create modal content
      const content = document.createElement('div');
      content.className = 'gd-modal-content';
      content.style.cssText = `
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        width: 90%;
        max-width: 600px;
        max-height: 80%;
        display: flex;
        flex-direction: column;
      `;
      
      // Create header
      const header = document.createElement('div');
      header.className = 'gd-modal-header';
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e0e0e0;
      `;
      
      const title = document.createElement('h3');
      title.style.cssText = 'margin: 0; color: #333; font-size: 18px; font-weight: 500;';
      title.textContent = `Found ${this.links.length} Links`;
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'gd-close-btn';
      closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 24px;
        height: 24px;
      `;
      closeBtn.textContent = '×';
      
      header.appendChild(title);
      header.appendChild(closeBtn);
      
      // Create controls
      const controls = document.createElement('div');
      controls.className = 'gd-modal-controls';
      controls.style.cssText = `
        padding: 16px 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      `;
      
      const btnPrimary = document.createElement('button');
      btnPrimary.className = 'gd-btn-primary';
      btnPrimary.style.cssText = `
        background: #1a73e8;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
      `;
      btnPrimary.textContent = `Open All Valid (${this.links.filter(l => l.isValid).length})`;
      
      const btnSelected = document.createElement('button');
      btnSelected.className = 'gd-btn-selected';
      btnSelected.style.cssText = `
        background: #34a853;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        display: none;
      `;
      btnSelected.textContent = 'Open Selected';
      
      const btnSelectAll = document.createElement('button');
      btnSelectAll.className = 'gd-btn-secondary gd-select-all';
      btnSelectAll.style.cssText = `
        background: #f8f9fa;
        color: #333;
        border: 1px solid #dadce0;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
      `;
      btnSelectAll.textContent = 'Select All';
      
      const btnSelectNone = document.createElement('button');
      btnSelectNone.className = 'gd-btn-secondary gd-select-none';
      btnSelectNone.style.cssText = `
        background: #f8f9fa;
        color: #333;
        border: 1px solid #dadce0;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
      `;
      btnSelectNone.textContent = 'Clear All';
      
      controls.appendChild(btnPrimary);
      controls.appendChild(btnSelected);
      controls.appendChild(btnSelectAll);
      controls.appendChild(btnSelectNone);
      
      // Create links list
      const linksList = document.createElement('div');
      linksList.className = 'gd-modal-list';
      linksList.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 0 20px 20px;
        max-height: 400px;
      `;
      
      // Add links
      this.links.forEach((link, index) => {
        const linkItem = document.createElement('div');
        linkItem.style.cssText = `
          display: flex;
          align-items: flex-start;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        `;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `gd_link_${index}`;
        checkbox.checked = link.isValid;
        checkbox.style.cssText = `
          margin-right: 12px;
          margin-top: 2px;
          cursor: pointer;
        `;
        
        const label = document.createElement('label');
        label.htmlFor = `gd_link_${index}`;
        label.style.cssText = `
          flex: 1;
          cursor: pointer;
        `;
        
        const linkText = document.createElement('div');
        linkText.style.cssText = `
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
          line-height: 1.4;
        `;
        linkText.textContent = link.text + (link.isValid ? '' : ' (Invalid)');
        
        const linkUrl = document.createElement('div');
        linkUrl.style.cssText = `
          color: #666;
          font-size: 13px;
          word-break: break-all;
          line-height: 1.3;
        `;
        linkUrl.textContent = link.url;
        
        label.appendChild(linkText);
        label.appendChild(linkUrl);
        linkItem.appendChild(checkbox);
        linkItem.appendChild(label);
        linksList.appendChild(linkItem);
      });
      
      // Assemble modal
      content.appendChild(header);
      content.appendChild(controls);
      content.appendChild(linksList);
      overlay.appendChild(content);
      modal.appendChild(overlay);

      return modal;
    }

    setupEventListeners(modal) {
      // Close button
      modal.querySelector('.gd-close-btn').addEventListener('click', () => {
        modal.remove();
      });

      // Click outside to close
      modal.querySelector('.gd-modal-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('gd-modal-overlay')) {
          modal.remove();
        }
      });

      // Open all valid
      modal.querySelector('.gd-btn-primary').addEventListener('click', () => {
        const validLinks = this.links.filter(link => link.isValid);
        this.openLinks(validLinks.map(link => link.url));
      });

      // Open selected
      modal.querySelector('.gd-btn-selected').addEventListener('click', () => {
        const selectedUrls = [];
        modal.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
          const index = parseInt(checkbox.id.split('_')[2]);
          selectedUrls.push(this.links[index].url);
        });
        this.openLinks(selectedUrls);
      });

      // Select all
      modal.querySelector('.gd-select-all').addEventListener('click', () => {
        modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        this.updateSelectedButton(modal);
      });

      // Clear all
      modal.querySelector('.gd-select-none').addEventListener('click', () => {
        modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        this.updateSelectedButton(modal);
      });

      // Update selected button
      modal.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => this.updateSelectedButton(modal));
      });

      this.updateSelectedButton(modal);
    }

    updateSelectedButton(modal) {
      const checkedCount = modal.querySelectorAll('input[type="checkbox"]:checked').length;
      const selectedBtn = modal.querySelector('.gd-btn-selected');
      selectedBtn.style.display = checkedCount > 0 ? 'inline-block' : 'none';
      selectedBtn.textContent = `Open Selected (${checkedCount})`;
    }

    openLinks(urls) {
      if (urls.length === 0) {
        alert('No links selected.');
        return;
      }

      if (urls.length > 10) {
        if (!confirm(`You're about to open ${urls.length} links. This might open many tabs. Continue?`)) {
          return;
        }
      }

      let opened = 0;
      const delay = 150; // Delay between opening to prevent browser blocking

      urls.forEach((url, index) => {
        setTimeout(() => {
          try {
            window.open(url, '_blank');
            opened++;
            
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

  // Create global instance
  window.googleDocsLinkOpenerBookmarklet = new GoogleDocsLinkOpenerBookmarklet();

})();