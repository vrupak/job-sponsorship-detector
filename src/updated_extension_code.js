// Keywords related to visa sponsorship
const visaKeywords = [
  "h1b", "h-1b", "visa", "sponsorship", "sponsored",
  "work permit", "immigration", "green card", "OPT", "CPT",
  "authorization", "authorized", "citizen", "resident",
  "EAD", "employment authorization", "TN visa", "L1", "L-1",
  "O-1", "J-1", "F1", "F-1", "GC", "international candidate", 
  "US work eligibility"
];

// Companies that have sponsored visas in the past (will be loaded from CSV)
let sponsoringCompanies = [];

// Regular expressions
const visaKeywordRegex = new RegExp(`\\b(${visaKeywords.join("|")})\\b`, "gi");
let companyRegex = null;

// Load sponsoring companies from CSV file
function loadSponsoringCompanies() {
  const fileUrl = chrome.runtime.getURL('data/companies.csv');
  
  fetch(fileUrl)
    .then(response => response.text())
    .then(csvData => {
      // Parse CSV data - assuming simple CSV with one company per line
      sponsoringCompanies = csvData
        .split('\n')
        .map(line => line.trim())
        .filter(company => company.length > 0);
      
      // Create regex for matching companies
      companyRegex = new RegExp(`\\b(${sponsoringCompanies.join("|")})\\b`, "gi");
      
      // Process the current page with the loaded companies
      handleJobDescriptionChange();
    })
    .catch(error => {
      console.error('Error loading companies CSV file:', error);
      // If file loading fails, continue with just visa keywords
      handleJobDescriptionChange();
    });
}

function highlightText(textNode) {
  const parent = textNode.parentNode;
  if (!parent) return;

  const span = document.createElement("span");
  span.innerHTML = textNode.textContent.replace(visaKeywordRegex, match => {
    return `<span style="background-color: limegreen; color: black; font-weight: bold;">${match}</span>`;
  });

  try {
    parent.replaceChild(span, textNode);
  } catch (e) {
    // Ignore nodes that can't be replaced
  }
}

function highlightKeywordsIn(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes = [];
  const matchedVisaKeywords = [];
  const matchedCompanies = [];

  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    // Check for visa keywords
    const visaMatches = node.textContent.match(visaKeywordRegex);
    if (visaMatches) {
      matchedVisaKeywords.push(...visaMatches.map(m => m.toUpperCase()));
      highlightText(node);
    }
    
    // Check for sponsoring companies if regex is available
    if (companyRegex) {
      const companyMatches = node.textContent.match(companyRegex);
      if (companyMatches) {
        matchedCompanies.push(...companyMatches.map(m => m.trim()));
      }
    }
  });

  // Create appropriate banner based on findings
  if (matchedCompanies.length > 0) {
    // Create a banner for matched sponsoring companies
    const uniqueCompanies = [...new Set(matchedCompanies)];
    createBanner({
      text: "This company has sponsored visas in the past:",
      keywords: uniqueCompanies,
      background: "#e6ffed",
      borderColor: "#52c41a"
    });
  } else if (matchedVisaKeywords.length > 0) {
    // Create a banner for matched visa keywords
    const uniqueKeywords = [...new Set(matchedVisaKeywords)];
    createBanner({
      text: "Sponsorship-related terms detected:",
      keywords: uniqueKeywords,
      background: "#fffbe6",
      borderColor: "#faad14"
    });
  } else {
    // Create a banner for no matches
    createBanner({
      text: "No sponsorship-related keywords found in this job description.",
      keywords: [],
      background: "#e6f7ff",
      borderColor: "#1890ff"
    });
  }
}

function createBanner({ text, keywords = [], background, borderColor }) {
  const jobContent = document.querySelector("#job-details");
  if (!jobContent || jobContent.dataset.bannerDismissed === "true") return;
  if (document.getElementById("keyword-alert-banner")) return;

  const banner = document.createElement("div");
  banner.id = "keyword-alert-banner";
  banner.style.cssText = `
    background: ${background};
    color: #000;
    padding: 12px 16px;
    border-left: 5px solid ${borderColor};
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

  banner.innerHTML = "";

  const styledKeywords = keywords.map(kw => {
    return `<span style="color: black; font-weight:bold;">${kw}</span>`;
  }).join(", ");

  const message = document.createElement("div");
  message.innerHTML = keywords.length > 0
    ? `${text} ${styledKeywords}`
    : text;

  banner.appendChild(message);
  banner.appendChild(closeBtn);

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
  // Load companies first, then process the page
  loadSponsoringCompanies();
  
  const checkInterval = setInterval(() => {
    const wrapper = document.querySelector(".jobs-search__job-details--wrapper");
    if (wrapper) {
      clearInterval(checkInterval);
      waitForJobChanges();
    }
  }, 500);
});