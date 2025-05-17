const visaKeywords = [
  "h1b", "h-1b", "visa", "sponsorship", "sponsored",
  "work permit", "immigration", "green card", "OPT", "CPT",
  "authorization", "authorized", "citizen", "resident",
  "EAD", "employment authorization", "TN visa", "L1", "L-1",
  "O-1", "J-1", "F1", "F-1", "GC", "international candidate", 
  "US work eligibility"
];

// Hardcoded sponsoring companies - extracted from your CSV
const sponsoringCompanies = [
  "1 800 FLOWERS COM INC",
  "1 HOTEL KAUAI LLC DBA 1 HOTEL HANALEI BAY",
  "1 OAK MEDIA LLC",
  "1 POINT SYSTEM LLC"
  // Add more companies from your CSV here
];

// Regular expressions for matching
const visaKeywordRegex = new RegExp(`\\b(${visaKeywords.join("|")})\\b`, "gi");
let companyNameRegex = null;

// Helper function to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\const visaKeywords = [
  "h1b", "h-1b", "visa", "sponsorship", "sponsored",
  "work permit", "immigration", "green card", "OPT", "CPT",
  "authorization", "authorized", "citizen", "resident",
  "EAD", "employment authorization", "TN visa", "L1", "L-1",
  "O-1", "J-1", "F1", "F-1", "GC", "international candidate", 
  "US work eligibility"
];

// Company names from CSV will be loaded into this array
let sponsoringCompanies = [];

// Regular expressions for matching
const visaKeywordRegex = new RegExp(`\\b(${visaKeywords.join("|")})\\b`, "gi");
let companyNameRegex = null;

// Helper function to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to parse CSV data and extract company names
function parseCompaniesCSV(csvText) {
  const lines = csvText.split('\n');
  const companies = [];
  
  // Skip header row if it exists
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma, but handle potential quotes
    const parts = line.split(',');
    
    // Assuming company name is in the 3rd column (index 2) based on your sample
    // Adjust this index if the company name is in a different column
    if (parts.length >= 3) {
      const companyName = parts[2].trim();
      if (companyName && companyName.length > 1) {
        // Remove quotes if present
        const cleanName = companyName.replace(/^"|"$/g, '').trim();
        if (cleanName) companies.push(cleanName);
      }
    }
  }
  
  return companies;
}

// Function to load CSV file with company names
function loadCompaniesCSV() {
  // Create a file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  
  // Create a button to trigger file selection
  const loadButton = document.createElement('button');
  loadButton.textContent = 'Load Sponsoring Companies CSV';
  loadButton.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    padding: 8px 12px;
    background: #0073b1;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  `;
  
  document.body.appendChild(loadButton);
  
  // Handle file selection
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        sponsoringCompanies = parseCompaniesCSV(e.target.result);
        
        // Update regex after loading companies
        if (sponsoringCompanies.length > 0) {
          // Sort by length (descending) to match longer company names first
          sponsoringCompanies.sort((a, b) => b.length - a.length);
          
          // Escape special regex characters in company names
          const escapedCompanyNames = sponsoringCompanies.map(name => escapeRegExp(name));
          
          // Create regex that matches whole words only for shorter names
          companyNameRegex = new RegExp(
            escapedCompanyNames.map(name => {
              // For longer company names, don't require word boundaries
              if (name.length > 10) {
                return name;
              } 
              // For shorter names, require word boundaries to avoid false positives
              return `\\b${name}\\b`;
            }).join("|"), 
            "gi"
          );
          
          // Show success notification
          showNotification(`Loaded ${sponsoringCompanies.length} sponsoring companies!`);
          
          // Re-scan current job description if open
          const jobContent = document.querySelector("#job-details");
          if (jobContent) {
            delete jobContent.dataset.keywordsHighlighted;
            delete jobContent.dataset.bannerDismissed;
            
            const oldBanner = document.getElementById("keyword-alert-banner");
            if (oldBanner) oldBanner.remove();
            
            handleJobDescriptionChange();
          }
        }
      } catch (error) {
        console.error("Error parsing CSV:", error);
        showNotification("Error parsing CSV file. Please check format.", true);
      }
    };
    
    reader.readAsText(file);
  });
  
  // Trigger file selection when button is clicked
  loadButton.addEventListener('click', () => {
    fileInput.click();
  });
}

function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 60px;
    right: 10px;
    z-index: 9999;
    padding: 12px;
    background: ${isError ? '#ffcdd2' : '#e0f7fa'};
    color: ${isError ? '#b71c1c' : '#006064'};
    border-left: 4px solid ${isError ? '#f44336' : '#00acc1'};
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    max-width: 300px;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}');
}

// Initialize the company name regex
function initializeCompanyNameRegex() {
  if (sponsoringCompanies.length > 0) {
    // Sort by length (descending) to match longer company names first
    const sortedCompanies = [...sponsoringCompanies].sort((a, b) => b.length - a.length);
    
    // Escape special regex characters in company names
    const escapedCompanyNames = sortedCompanies.map(name => escapeRegExp(name));
    
    // Create regex that matches whole words only for shorter names
    companyNameRegex = new RegExp(
      escapedCompanyNames.map(name => {
        // For longer company names, don't require word boundaries
        if (name.length > 10) {
          return name;
        } 
        // For shorter names, require word boundaries to avoid false positives
        return `\\b${name}\\b`;
      }).join("|"), 
      "gi"
    );
    
    console.log(`Initialized regex for ${sponsoringCompanies.length} sponsoring companies`);
  }
}

function highlightText(textNode, matchType) {
  const parent = textNode.parentNode;
  if (!parent) return [];
  
  const span = document.createElement("span");
  const foundMatches = [];
  let highlightColor, fontColor;
  let regex;
  
  if (matchType === 'visa') {
    regex = visaKeywordRegex;
    highlightColor = 'limegreen';
    fontColor = 'black';
  } else if (matchType === 'company') {
    regex = companyNameRegex;
    highlightColor = '#ffeb3b'; // Yellow for company names
    fontColor = 'black';
  }
  
  if (!regex) return [];
  
  span.innerHTML = textNode.textContent.replace(regex, match => {
    foundMatches.push(match);
    return `<span style="background-color: ${highlightColor}; color: ${fontColor}; font-weight: bold;">${match}</span>`;
  });
  
  try {
    parent.replaceChild(span, textNode);
  } catch (e) {
    // Ignore nodes that can't be replaced
  }
  
  return foundMatches;
}

function highlightKeywordsIn(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes = [];
  const matchedVisaKeywords = [];
  const matchedCompanies = [];

  while (walker.nextNode()) nodes.push(walker.currentNode);

  // First highlight visa keywords
  nodes.forEach(node => {
    const matches = highlightText(node, 'visa');
    if (matches.length > 0) {
      matchedVisaKeywords.push(...matches.map(m => m.toUpperCase()));
    }
  });

  // Then highlight company names if we have them loaded
  if (companyNameRegex) {
    // Need to create a new walker since the DOM has been modified
    const newWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const newNodes = [];
    while (newWalker.nextNode()) newNodes.push(newWalker.currentNode);
    
    newNodes.forEach(node => {
      const matches = highlightText(node, 'company');
      if (matches.length > 0) {
        matchedCompanies.push(...matches);
      }
    });
  }

  // Create banner with results
  createBanner({
    visaKeywords: [...new Set(matchedVisaKeywords)],
    companies: [...new Set(matchedCompanies)]
  });
}

function createBanner({ visaKeywords = [], companies = [] }) {
  const jobContent = document.querySelector("#job-details");
  if (!jobContent || jobContent.dataset.bannerDismissed === "true") return;
  if (document.getElementById("keyword-alert-banner")) return;

  const banner = document.createElement("div");
  banner.id = "keyword-alert-banner";
  banner.style.cssText = `
    background: #fffbe6;
    color: #000;
    padding: 12px 16px;
    border-left: 5px solid #faad14;
    border-radius: 6px;
    margin: 16px 0;
    font-size: 16px;
    position: relative;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  `;

  const closeBtn = document.createElement("span");
  closeBtn.textContent = "✖";
  closeBtn.style.cssText = `
    position: absolute;
    top: 6px;
    right: 6px;
    cursor: pointer;
    font-size: 10px;
    font-weight: normal;
  `;
  closeBtn.onclick = () => {
    banner.remove();
    if (jobContent) jobContent.dataset.bannerDismissed = "true";
  };

  banner.appendChild(closeBtn);

  // Create content based on what was found
  const content = document.createElement('div');
  
  if (visaKeywords.length > 0 || companies.length > 0) {
    // Something was found
    if (visaKeywords.length > 0) {
      const visaSection = document.createElement('div');
      visaSection.style.marginBottom = '8px';
      visaSection.innerHTML = `<strong>Sponsorship terms found:</strong> ${visaKeywords.map(kw => 
        `<span style="font-weight:bold;">${kw}</span>`).join(", ")}`;
      content.appendChild(visaSection);
    }
    
    if (companies.length > 0) {
      const companySection = document.createElement('div');
      companySection.innerHTML = `<strong>Known sponsoring companies found:</strong> ${companies.map(c => 
        `<span style="font-weight:bold; color:#d32f2f;">${c}</span>`).join(", ")}`;
      content.appendChild(companySection);
    }
  } else {
    // Nothing found
    content.innerHTML = `<strong>No sponsorship keywords or known sponsoring companies found.</strong>`;
    banner.style.background = '#e6f7ff';
    banner.style.borderColor = '#1890ff';
  }
  
  banner.appendChild(content);
  
  const tryInsert = () => {
    const mt4Div = document.querySelector("div.mt4");
    if (mt4Div && mt4Div.parentElement) {
      mt4Div.parentElement.insertBefore(banner, mt4Div.nextSibling);
    } else {
      setTimeout(tryInsert, 100);
    }
  };

  tryInsert();
}

function handleJobDescriptionChange() {
  const jobContent = document.querySelector("#job-details");
  if (
    !jobContent ||
    jobContent.dataset.keywordsHighlighted === "true" ||
    jobContent.dataset.bannerDismissed === "true"
  ) return;

  const maxRetries = 20;
  let tries = 0;

  const waitForContent = () => {
    const text = jobContent.innerText.trim();
    if (text.length > 50) {
      highlightKeywordsIn(jobContent);
      jobContent.dataset.keywordsHighlighted = "true";
    } else if (tries++ < maxRetries) {
      setTimeout(waitForContent, 200);
    }
  };

  waitForContent();
}

function waitForJobChanges() {
  const wrapper = document.querySelector(".jobs-search__job-details--wrapper");
  if (!wrapper) return;

  let lastJobText = "";
  let debounceTimer;

  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const jobContent = document.querySelector("#job-details");
      if (!jobContent) return;

      const currentText = jobContent.innerText.trim();
      if (currentText && currentText !== lastJobText) {
        lastJobText = currentText;

        delete jobContent.dataset.keywordsHighlighted;
        delete jobContent.dataset.bannerDismissed;

        const oldBanner = document.getElementById("keyword-alert-banner");
        if (oldBanner) oldBanner.remove();

        handleJobDescriptionChange();
      }
    }, 250);
  });

  observer.observe(wrapper, { childList: true, subtree: true });
  handleJobDescriptionChange();
}

window.addEventListener("load", () => {
  // Add the load CSV button
  loadCompaniesCSV();
  
  const checkInterval = setInterval(() => {
    const wrapper = document.querySelector(".jobs-search__job-details--wrapper");
    if (wrapper) {
      clearInterval(checkInterval);
      waitForJobChanges();
    }
  }, 500);
});