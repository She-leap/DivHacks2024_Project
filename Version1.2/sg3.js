let clothingKeywords = [];
const whitelist = ["google.com"];

// Function to load the JSON file with keywords
function loadKeywords() {
  fetch(chrome.runtime.getURL('keywords.json'))
    .then((response) => response.json())
    .then((data) => {
      clothingKeywords = data.clothingKeywords;
      console.log('Keywords loaded:', clothingKeywords);
    })
    .catch((error) => {
      console.error('Error loading keywords:', error);
    });
}

// Function to check if the URL is whitelisted
function isWhitelisted(url) {
  return whitelist.some(domain => new URL(url).hostname.endsWith(domain));
}

// Function to check if the URL contains clothing-related keywords
function isClothingWebsite(url) {
  return clothingKeywords.some(keyword => url.toLowerCase().includes(keyword));
}

// Function to fetch page content and check for clothing-related keywords
function checkPageContent(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => {
      const title = document.title || '';
      const metaDescription = document.querySelector("meta[name='description']")?.getAttribute("content") || '';
      return { title, metaDescription };
    },
    world: 'MAIN',
    injectImmediately: true
  }, (results) => {
    if (results && results[0]) {
      const { title, metaDescription } = results[0];
      const pageContent = title + " " + metaDescription;

      // Check for clothing-related keywords in the page content
      if (clothingKeywords.some(keyword => pageContent.toLowerCase().includes(keyword))) {
        // Show notification if clothing keywords are found
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon48.png",
          title: "Clothing Website Detected",
          message: "You are visiting a clothing-related website!",
          priority: 2
        });
      }
    }
  });
}

// Use tabs.onUpdated to detect when a tab is updated (new page starts loading)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only check if the tab's URL is fully available
  if (changeInfo.status === 'loading' && tab.url) {
    // Check if the URL is whitelisted
    if (isWhitelisted(tab.url)) {
      console.log('This website is whitelisted:', tab.url);
      return; // Skip further checks if the URL is on the whitelist
    }

    // Check if the URL contains clothing-related keywords first
    if (isClothingWebsite(tab.url)) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon48.png",
        title: "Clothing Website Detected",
        message: "You are visiting a clothing-related website!",
        priority: 2
      });
    } else {
      // If URL check fails, check page content after the DOM is ready
      checkPageContent(tabId);
    }
  }
});