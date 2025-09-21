(function() {
  'use strict';

  const urlMatch = window.location.href.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (!urlMatch) {
    alert('Could not extract document ID from URL');
    return;
  }
  
  const docId = urlMatch[1];
  const docUrl = window.location.href.split('?')[0].split('#')[0]; // Clean URL
  
  console.log('Document ID:', docId);
  console.log('Document URL:', docUrl);

  const webAppUrl = 'https://script.google.com/macros/s/AKfycbxRhTWGO4_uMsDJDDKrcGmjIq6dZcXnnUKylt3pvPpb-HoAf7edVGYG1TJge_bL4OFDng/exec'  
  console.log('Opening web app with document URL...');

  const webAppWithParams = webAppUrl + '?docUrl=' + encodeURIComponent(docUrl);
  window.open(webAppWithParams, 'linkOpener', 'width=900,height=700,scrollbars=yes,resizable=yes');
})();