const keywords = [
  "h1b", "h-1b", "visa", "sponsorship", "sponsored",
  "work permit", "immigration", "green card", "OPT", "CPT",
  "authorization", "authorized", "citizen", "resident",
  "EAD", "employment authorization", "TN visa", "L1", "L-1",
  "O-1", "J-1", "F1", "F-1", "GC", "international candidate",
  "US work eligibility"
];

// Companies that have sponsored visas in the past (will be loaded from CSV)
let sponsoringCompanies = [];
let currentCompanySponsorsVisas = false;

const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
const keywordOccurrences = {};
const keywordCounter = {};

// Load sponsoring companies from CSV file
function loadSponsoringCompanies() {
  const fileUrl = chrome.runtime.getURL('data/companies.csv');
  
  fetch(fileUrl)
    .then(response => response.text())
    .then(csvData => {
      // Parse CSV data - assuming simple CSV with one company per line
      sponsoringCompanies = csvData
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(company => company.length > 0);
      
      // Process the current page with the loaded companies
      checkCurrentCompany();
      handleJobDescriptionChange();
    })
    .catch(error => {
      console.error('Error loading companies CSV file:', error);
      // If file loading fails, continue with just visa keywords
      handleJobDescriptionChange();
    });
}

// Check if current company is in our sponsoring companies list
function checkCurrentCompany() {
  currentCompanySponsorsVisas = false;

  let companyName = null;

  // First try: anchor tag (most common case)
  const companyAnchor = document.querySelector(".job-details-jobs-unified-top-card__company-name a[data-test-app-aware-link]");
  if (companyAnchor) {
    companyName = companyAnchor.textContent.trim();
  } else {
    // Fallback: div without anchor
    const companyDiv = document.querySelector(".job-details-jobs-unified-top-card__company-name");
    if (companyDiv) {
      companyName = companyDiv.textContent.trim();
    }
  }

  if (!companyName) {
    console.warn("[Visa Scanner] Company name not found.");
    return;
  }

  console.log("[Visa Scanner] Detected company name:", companyName);

  // Normalize both strings
  const normalize = str =>
    str
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const normalizedCompany = normalize(companyName);

  currentCompanySponsorsVisas = sponsoringCompanies.some(rawCompany => {
    const normalizedSponsor = normalize(rawCompany);
    return (
      normalizedCompany === normalizedSponsor ||
      normalizedCompany.startsWith(normalizedSponsor) ||
      normalizedSponsor.startsWith(normalizedCompany)
    );
  });

  console.log("[Visa Scanner] Sponsorship match found?", currentCompanySponsorsVisas);
}

function highlightText(textNode) {
  const parent = textNode.parentNode;
  if (!parent) return;

  const span = document.createElement("span");
  span.innerHTML = textNode.textContent.replace(keywordRegex, match => {
    const key = match.toLowerCase();
    keywordCounter[key] = (keywordCounter[key] || 0) + 1;
    const id = `${key.replace(/\s+/g, "-")}-${keywordCounter[key]}`;

    if (!keywordOccurrences[key]) keywordOccurrences[key] = [];
    keywordOccurrences[key].push(id);

    return `<span id="${id}" style="background-color: #faad14; color: black; font-weight: bold;">${match}</span>`;
  });

  try {
    parent.replaceChild(span, textNode);
  } catch (e) {}
}

function highlightKeywordsIn(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes = [];
  const matchedKeywords = [];

  // Reset
  Object.keys(keywordOccurrences).forEach(k => delete keywordOccurrences[k]);
  Object.keys(keywordCounter).forEach(k => delete keywordCounter[k]);

  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    const matches = node.textContent.match(keywordRegex);
    if (matches) {
      matchedKeywords.push(...matches.map(m => m.toUpperCase()));
      highlightText(node);
    }
  });

  const unique = [...new Set(matchedKeywords)];
  if (unique.length > 0) {
    createBanner({
      text: "Sponsorship-related terms detected:",
      keywords: unique,
      background: "#fffbe6",
      borderColor: "#faad14"
    });
  } else {
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

  const message = document.createElement("div");
  if (keywords.length > 0) {
    const parts = keywords.map(kw => {
      const key = kw.toLowerCase();
      const ids = keywordOccurrences[key] || [];
      const base = key.replace(/\s+/g, "-");

      if (ids.length === 1) {
        return `<a href="#${ids[0]}" onclick="event.preventDefault();document.getElementById('${ids[0]}').scrollIntoView({behavior:'smooth'});" style="font-weight: bold; color: black;">${kw}</a>`;
      } else {
        const nums = ids.map((id, i) =>
          `<a href="#${id}" onclick="event.preventDefault();document.getElementById('${id}').scrollIntoView({behavior:'smooth'});">${i + 1}</a>`
        ).join(" ");
        return `<span style="font-weight: bold;">${kw}</span> ${nums}`;
      }
    }).join(", ");

    message.innerHTML = `${text} ${parts}`;
  } else {
    message.textContent = text;
  }

  // Company sponsorship info
  if (currentCompanySponsorsVisas) {
    const companyInfo = document.createElement("div");
    companyInfo.innerHTML = `<div style="margin-top: 8px; font-weight: bold; color: #52c41a;">✓ This company has sponsored visas in 2024</div>`;
    message.appendChild(companyInfo);
  }

  banner.appendChild(message);

  // Only show info icon when keywords are found
  if (keywords.length > 0) {
    const infoIcon = document.createElement("span");
    infoIcon.innerHTML = "&#9432;";
    infoIcon.style.cssText = `
      position: absolute;
      right: 4px;
      bottom: 0px;
      font-size: 20px;
      color: #000;
      cursor: default;
      user-select: none;
    `;

    const tooltip = document.createElement("div");
    tooltip.textContent = "Click on the keywords to jump to their location in the job description.";
    tooltip.style.cssText = `
      position: absolute;
      right: 0;
      top: 32px;
      background: #333;
      color: #fff;
      padding: 6px 10px;
      font-size: 12px;
      border-radius: 4px;
      white-space: nowrap;
      z-index: 1001;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease-in-out;
    `;
    infoIcon.onmouseenter = () => tooltip.style.opacity = "0.8";
    infoIcon.onmouseleave = () => tooltip.style.opacity = "0";

    banner.appendChild(infoIcon);
    banner.appendChild(tooltip);
  }

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

        // Check if the company sponsors visas before handling the job description
        checkCurrentCompany();
        handleJobDescriptionChange();
      }
    }, 250);
  });

  observer.observe(wrapper, { childList: true, subtree: true });
  
  // Check if company sponsors visas
  checkCurrentCompany();
  handleJobDescriptionChange();
}

window.addEventListener("load", () => {
  // Load companies first
  loadSponsoringCompanies();
  
  const checkInterval = setInterval(() => {
    const wrapper = document.querySelector(".jobs-search__job-details--wrapper");
    if (wrapper) {
      clearInterval(checkInterval);
      waitForJobChanges();
    }
  }, 500);
});
