// Background service worker for Chrome Extension

// When extension icon is clicked, open app in new tab
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  });
});

// Optional: Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('SVGify installed');
    // Open app on first install
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html')
    });
  }
});
