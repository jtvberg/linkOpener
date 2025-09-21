# Google Docs Link Opener - Automation Options

This repository now provides **multiple automation options** to make opening all links in a Google Document seamless. Choose the option that best fits your needs:

## 🎯 Quick Comparison

| Method | Setup Time | User Experience | Distribution | Technical Level |
|--------|------------|-----------------|--------------|----------------|
| **Bookmarklet** | 30 seconds | Good | Easy sharing | Beginner |
| **Chrome Extension** | 5 minutes | Excellent | Chrome Web Store | Intermediate |
| **Web App** | Current method | Good | URL sharing | Beginner |

## 🔗 Option 1: Bookmarklet (Recommended for Quick Setup)

**Best for**: Immediate use, easy sharing, works in any browser

### Installation
1. **Drag this link to your bookmarks bar**: [📝 Open Google Docs Links](javascript:(function(){'use strict';if(!window.location.href.includes('docs.google.com/document/')){alert('This%20bookmarklet%20only%20works%20on%20Google%20Docs%20pages.%20Please%20navigate%20to%20a%20Google%20Doc%20and%20try%20again.');return;}if(window.googleDocsLinkOpenerBookmarklet){window.googleDocsLinkOpenerBookmarklet.showDialog();return;}class%20GoogleDocsLinkOpenerBookmarklet{constructor(){this.links=[];this.modalId='gd-link-opener-modal';this.init();}init(){this.extractLinks();this.showDialog();}extractLinks(){this.links=[];const%20visited=new%20Set();try{const%20linkElements=document.querySelectorAll('a[href]');linkElements.forEach(link=>{const%20href=link.getAttribute('href');const%20text=link.textContent.trim();if(href&&text&&!visited.has(href+'|'+text)){visited.add(href+'|'+text);this.links.push({text:text,url:href,isValid:this.isValidUrl(href)});}});this.extractFromDocsCanvas();}catch(error){console.log('Link%20extraction%20error:',error);}console.log(`Found%20${this.links.length}%20links`);}extractFromDocsCanvas(){const%20docsElements=document.querySelectorAll('[data-link-url]');const%20visited=new%20Set();docsElements.forEach(element=>{const%20href=element.getAttribute('data-link-url');const%20text=element.textContent.trim();if(href&&text&&!visited.has(href+'|'+text)){visited.add(href+'|'+text);if(!this.links.some(link=>link.url===href&&link.text===text)){this.links.push({text:text,url:href,isValid:this.isValidUrl(href)});}}});}isValidUrl(url){if(!url||typeof%20url!=='string')return%20false;if(url.startsWith('http://')||url.startsWith('https://')){return%20true;}if(url.startsWith('mailto:')){return%20true;}if(url.includes('.')&&!url.includes('%20')){return%20true;}return%20false;}showDialog(){const%20existing=document.getElementById(this.modalId);if(existing)existing.remove();if(this.links.length===0){alert('No%20links%20found%20in%20this%20Google%20Document.%5Cn%5CnThis%20might%20happen%20if:%5Cn-%20The%20document%20has%20no%20hyperlinks%5Cn-%20The%20links%20are%20not%20yet%20loaded%5Cn-%20The%20document%20is%20still%20loading%5Cn%5CnTry%20waiting%20a%20moment%20and%20clicking%20the%20bookmarklet%20again.');return;}const%20modal=this.createModal();document.body.appendChild(modal);this.setupEventListeners(modal);}createModal(){const%20modal=document.createElement('div');modal.id=this.modalId;modal.innerHTML=`<div%20class="gd-modal-overlay"%20style="position:%20fixed;top:%200;left:%200;width:%20100%;height:%20100%;background:%20rgba(0,%200,%200,%200.7);z-index:%20999999;display:%20flex;align-items:%20center;justify-content:%20center;font-family:%20'Google%20Sans',%20'Segoe%20UI',%20Arial,%20sans-serif;"><div%20class="gd-modal-content"%20style="background:%20white;border-radius:%208px;box-shadow:%200%204px%2020px%20rgba(0,%200,%200,%200.3);width:%2090%;max-width:%20600px;max-height:%2080%;display:%20flex;flex-direction:%20column;"><div%20class="gd-modal-header"%20style="display:%20flex;justify-content:%20space-between;align-items:%20center;padding:%2016px%2020px;border-bottom:%201px%20solid%20#e0e0e0;"><h3%20style="margin:%200;%20color:%20#333;%20font-size:%2018px;%20font-weight:%20500;">Found%20${this.links.length}%20Links</h3><button%20class="gd-close-btn"%20style="background:%20none;border:%20none;font-size:%2024px;cursor:%20pointer;color:%20#666;padding:%200;width:%2024px;height:%2024px;">&times;</button></div><div%20class="gd-modal-controls"%20style="padding:%2016px%2020px;border-bottom:%201px%20solid%20#e0e0e0;display:%20flex;gap:%208px;flex-wrap:%20wrap;"><button%20class="gd-btn-primary"%20style="background:%20#1a73e8;color:%20white;border:%20none;border-radius:%204px;padding:%208px%2016px;font-size:%2014px;cursor:%20pointer;">Open%20All%20Valid%20(${this.links.filter(l=>l.isValid).length})</button><button%20class="gd-btn-selected"%20style="background:%20#34a853;color:%20white;border:%20none;border-radius:%204px;padding:%208px%2016px;font-size:%2014px;cursor:%20pointer;display:%20none;">Open%20Selected</button><button%20class="gd-btn-secondary%20gd-select-all"%20style="background:%20#f8f9fa;color:%20#333;border:%201px%20solid%20#dadce0;border-radius:%204px;padding:%208px%2016px;font-size:%2014px;cursor:%20pointer;">Select%20All</button><button%20class="gd-btn-secondary%20gd-select-none"%20style="background:%20#f8f9fa;color:%20#333;border:%201px%20solid%20#dadce0;border-radius:%204px;padding:%208px%2016px;font-size:%2014px;cursor:%20pointer;">Clear%20All</button></div><div%20class="gd-modal-list"%20style="flex:%201;overflow-y:%20auto;padding:%200%2020px%2020px;max-height:%20400px;">${this.links.map((link,index)=>`<div%20style="display:%20flex;align-items:%20flex-start;padding:%2012px%200;border-bottom:%201px%20solid%20#f0f0f0;"><input%20type="checkbox"%20id="gd_link_${index}"%20${link.isValid?'checked':''}%20style="margin-right:%2012px;margin-top:%202px;cursor:%20pointer;"><label%20for="gd_link_${index}"%20style="flex:%201;cursor:%20pointer;"><div%20style="font-weight:%20500;color:%20#333;margin-bottom:%204px;line-height:%201.4;">${this.escapeHtml(link.text)}${link.isValid?'':'%20(Invalid)'}</div><div%20style="color:%20#666;font-size:%2013px;word-break:%20break-all;line-height:%201.3;">${this.escapeHtml(link.url)}</div></label></div>`).join('')}</div></div></div>`;return%20modal;}setupEventListeners(modal){modal.querySelector('.gd-close-btn').addEventListener('click',()=>{modal.remove();});modal.querySelector('.gd-modal-overlay').addEventListener('click',(e)=>{if(e.target.classList.contains('gd-modal-overlay')){modal.remove();}});modal.querySelector('.gd-btn-primary').addEventListener('click',()=>{const%20validLinks=this.links.filter(link=>link.isValid);this.openLinks(validLinks.map(link=>link.url));});modal.querySelector('.gd-btn-selected').addEventListener('click',()=>{const%20selectedUrls=[];modal.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox=>{const%20index=parseInt(checkbox.id.split('_')[2]);selectedUrls.push(this.links[index].url);});this.openLinks(selectedUrls);});modal.querySelector('.gd-select-all').addEventListener('click',()=>{modal.querySelectorAll('input[type="checkbox"]').forEach(cb=>cb.checked=true);this.updateSelectedButton(modal);});modal.querySelector('.gd-select-none').addEventListener('click',()=>{modal.querySelectorAll('input[type="checkbox"]').forEach(cb=>cb.checked=false);this.updateSelectedButton(modal);});modal.querySelectorAll('input[type="checkbox"]').forEach(checkbox=>{checkbox.addEventListener('change',()=>this.updateSelectedButton(modal));});this.updateSelectedButton(modal);}updateSelectedButton(modal){const%20checkedCount=modal.querySelectorAll('input[type="checkbox"]:checked').length;const%20selectedBtn=modal.querySelector('.gd-btn-selected');selectedBtn.style.display=checkedCount>0?'inline-block':'none';selectedBtn.textContent=`Open%20Selected%20(${checkedCount})`;}openLinks(urls){if(urls.length===0){alert('No%20links%20selected.');return;}if(urls.length>10){if(!confirm(`You're%20about%20to%20open%20${urls.length}%20links.%20This%20might%20open%20many%20tabs.%20Continue?`)){return;}}let%20opened=0;const%20delay=150;urls.forEach((url,index)=>{setTimeout(()=>{try{window.open(url,'_blank');opened++;if(index===urls.length-1){setTimeout(()=>{alert(`Opened%20${opened}%20out%20of%20${urls.length}%20links.`);},500);}}catch(error){console.error('Failed%20to%20open%20link:',url,error);}},index*delay);});}escapeHtml(text){const%20div=document.createElement('div');div.textContent=text;return%20div.innerHTML;}}window.googleDocsLinkOpenerBookmarklet=new%20GoogleDocsLinkOpenerBookmarklet();})();)

2. **Navigate to any Google Doc**
3. **Click the bookmarklet** - it will find and display all links
4. **Choose which links to open** - select all or individual links

### Pros ✅
- **Zero installation** - works immediately
- **Universal compatibility** - works in all browsers  
- **Easy sharing** - just share the bookmark
- **No permissions needed** - works on any Google Doc page

### Cons ❌
- Manual activation required (click bookmark each time)
- Limited to browser DOM extraction (may miss some complex links)

## 🧩 Option 2: Chrome Extension (Best User Experience)

**Best for**: Frequent users, seamless integration, professional environments

### Installation
1. **Download** the `chrome-extension` folder from this repository
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top-right)
4. **Click "Load unpacked"** and select the `chrome-extension` folder
5. **Pin the extension** for easy access

### Usage
- **Automatic**: The extension adds a "🔗 Open Links" button to Google Docs toolbar
- **Manual**: Click the extension icon in your browser toolbar
- **Popup**: Use the popup interface for quick access

### Pros ✅
- **Seamless integration** - button appears directly in Google Docs
- **Always available** - no need to remember to activate
- **Advanced extraction** - uses multiple methods to find links
- **Professional interface** - matches Google's design language

### Cons ❌
- Chrome-specific (could be adapted for other browsers)
- Requires manual installation for each user
- May need approval for enterprise environments

## 🌐 Option 3: Web App (Current Method)

**Best for**: Sharing with teams, no installation requirements

Your existing Google Apps Script web app continues to work perfectly. Deploy it and share the URL.

### Usage
1. **Navigate** to your web app URL
2. **Paste** the Google Doc URL
3. **Extract and open** links

### Pros ✅
- **No installation** required
- **Shareable URL** - works for anyone
- **Robust extraction** - uses Google's own APIs
- **Cross-platform** - works on any device

### Cons ❌
- Requires copying/pasting document URLs
- Extra steps compared to direct integration

## 🔧 For Developers: Advanced Options

### Tampermonkey Script
Create a userscript that automatically loads on Google Docs pages:

```javascript
// ==UserScript==
// @name         Google Docs Link Opener
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Open all links in Google Docs
// @author       You
// @match        https://docs.google.com/document/*
// @grant        none
// ==/UserScript==

// Paste the bookmarklet code here
```

### Google Workspace Add-on
Extend your existing Apps Script to create a sidebar add-on that appears in Google Docs.

### Browser Extension for Other Browsers
The Chrome extension can be adapted for:
- **Firefox** (using WebExtensions API)
- **Safari** (using Safari Web Extensions)
- **Edge** (using same Chrome extension format)

## 📋 Implementation Recommendations

### For Personal Use:
**Start with the bookmarklet** - it's the fastest way to get automation working.

### For Teams (1-10 people):
**Use the Chrome extension** - better user experience, easier to distribute via email.

### For Organizations (10+ people):
**Deploy the web app** - centralized, no installation required, works on all devices.

### For Public Distribution:
**Publish the Chrome extension** to the Chrome Web Store for wider reach.

## 🚀 Next Steps

1. **Try the bookmarklet first** - drag the link above to your bookmarks bar
2. **If you like it, install the Chrome extension** for a better experience
3. **Share with your team** using the method that fits your environment

## 🔒 Security & Privacy

All options:
- ✅ Run locally in your browser
- ✅ No data sent to external servers
- ✅ Only access links you can already see
- ✅ Use your existing Google account permissions

## 📞 Support

If you need help with any of these options:
1. Check the individual README files in each folder
2. Try the web app version as a fallback
3. Open an issue in this repository

Choose the option that works best for your workflow and enjoy automated link opening! 🎉