// Keywords that likely indicate a clothing website
const clothingKeywords = ["clothing", "apparel", "fashion", "wear", "footwear", "shoes", "outfits", "garments", "boutique", "style", "socks", "mens clothes", "womens clothes", "kids clothes", "shop mens", "shop womens", "shop kids"];

// Function to check if the URL contains clothing-related keywords
function isClothingWebsite(url) {
  return clothingKeywords.some(keyword => url.toLowerCase().includes(keyword));
}

// Function to fetch page content and check for clothing-related keywords
function checkPageContent(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => {
      // Get page content and extract title and meta description
      const title = document.title || '';
      const metaDescription = document.querySelector("meta[name='description']")?.getAttribute("content") || '';
      return { title, metaDescription };
    }
  }, (results) => {
    if (results && results[0]) {
      const { title, metaDescription } = results[0];
      const pageContent = title + " " + metaDescription;

      // Check for clothing-related keywords in the page content
      if (clothingKeywords.some(keyword => pageContent.toLowerCase().includes(keyword))) {
        // Show notification if clothing keywords are found
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon48.png", // Add an icon
          title: "Clothing Website Detected",
          message: "You are visiting a clothing-related website! This company may use unethical labor.",
          priority: 2
        });
      }
    }
  });
}

// Listen for web navigation completion (when a website is fully loaded)
chrome.webNavigation.onCompleted.addListener((details) => {
  const url = details.url;

  // Check if the URL contains clothing-related keywords
  if (isClothingWebsite(url)) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon48.png",
      title: "Clothing Website Detected",
      message: "You are visiting a clothing-related website! This company may use unethical labor.",
      priority: 2
    });
  } else {
    // If URL check fails, check page content for clothing-related keywords
    checkPageContent(details.tabId);
  }
}, { url: [{ urlMatches: 'https://*/*' }, { urlMatches: 'http://*/*' }] });
