const keywords = [
  "h1b", "visa", "sponsorship", "work permit", "immigration",
  "green card", "OPT", "authorization", "citizen", "resident",
  "H-1B", "authorized"
];

// Create regex for keyword matching
const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");

// Companies known to offer sponsorship
let sponsorshipCompanies = [];


    }
    sponsorshipCompanies = await response.json();
    // Extract just the company names from the JSON if it has a sponsorshipCompanies property
    if (sponsorshipCompanies.sponsorshipCompanies) {
      sponsorshipCompanies = sponsorshipCompanies.sponsorshipCompanies;
    }
    console.log(`Loaded ${sponsorshipCompanies.length} sponsorship companies`);
  } catch (error) {
    console.error("Error loading sponsorship companies:", error);
    // Fall back to empty array if file can't be loaded
    sponsorshipCompanies = [];
  }
}

// Check if company name matches any in our list (case insensitive)
function isKnownSponsor(companyName) {
  if (!companyName || !sponsorshipCompanies.length) return false;
  
  companyName = companyName.toLowerCase();
  
  // Try exact match first
  if (sponsorshipCompanies.some(company => 
    company.toLowerCase() === companyName)) {
    return true;
  }
  
  // Try partial match - check if the company name contains any of our known sponsors
  // or if any of our known sponsors contains the company name
  return sponsorshipCompanies.some(company => {
    const lowerCompany = company.toLowerCase();
    return companyName.includes(lowerCompany) || 
           lowerCompany.includes(companyName);
  });
}

function highlightText(textNode, isCompanyMatch = false) {
  const parent = textNode.parentNode;
  if (!parent) return;
  
  const span = document.createElement("span");
  
  if (isCompanyMatch) {
    // For company matches, highlight the entire text
    span.innerHTML = `<span style="background-color: #ffcc00; color: black;" 
      title="This company may offer sponsorship based on your list">${textNode.textContent}</span>`;
  } else {
    // For keyword matches, highlight just the matching words
    span.innerHTML = textNode.textContent.replace(keywordRegex, match => {
      return `<span style="background-color: limegreen; color: black;">${match}</span>`;
    });
  }
  
  try {
    parent.replaceChild(span, textNode);
  } catch (e) {
    // Ignore nodes that can't be replaced
  }
}

function highlightKeywordsIn(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  
  nodes.forEach(node => {
    if (keywordRegex.test(node.textContent)) {
      highlightText(node);
    }
  });
}

function checkForCompanyMatch() {
  // Find company name in LinkedIn job posting
  const companyElement = document.querySelector('.jobs-unified-top-card__company-name');
  if (!companyElement) return false;
  
  const companyName = companyElement.textContent.trim();
  if (!companyName) return false;
  
  if (isKnownSponsor(companyName)) {
    // Highlight the company name
    const companyTextNode = Array.from(companyElement.childNodes)
      .find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() === companyName);
    
    if (companyTextNode) {
      highlightText(companyTextNode, true);
    }
    
    // Also add an indicator to the job card
    const jobHeader = document.querySelector('.jobs-unified-top-card__job-title');
    if (jobHeader) {
      const sponsorBadge = document.createElement('span');
      sponsorBadge.className = 'sponsorship-indicator';
      sponsorBadge.innerHTML = ' 🌟';
      sponsorBadge.title = 'Company known to offer sponsorship';
      sponsorBadge.style.color = '#ffcc00';
      
      // Only add if not already present
      if (!jobHeader.querySelector('.sponsorship-indicator')) {
        jobHeader.appendChild(sponsorBadge);
      }
    }
    
    return true;
  }
  
  return false;
}

function handleJobDescriptionChange() {
  const jobContent = document.querySelector("#job-details");
  if (jobContent && !jobContent.dataset.keywordsHighlighted) {
    requestIdleCallback(() => {
      // Check for keywords in job description
      highlightKeywordsIn(jobContent);
      
      // Check if the company is in our list
      const isCompanyMatch = checkForCompanyMatch();
      
      // Add a notice at the top of job description if it's a known sponsor
      if (isCompanyMatch) {
        const noticeDiv = document.createElement('div');
        noticeDiv.style.padding = '10px';
        noticeDiv.style.marginBottom = '15px';
        noticeDiv.style.backgroundColor = '#fffae6';
        noticeDiv.style.border = '1px solid #ffcc00';
        noticeDiv.style.borderRadius = '4px';
        noticeDiv.innerHTML = '⭐ This company is in your sponsorship companies list.';
        
        // Insert at the beginning of job details
        if (jobContent.firstChild) {
          jobContent.insertBefore(noticeDiv, jobContent.firstChild);
        } else {
          jobContent.appendChild(noticeDiv);
        }
      }
      
      jobContent.dataset.keywordsHighlighted = "true";
    });
  }
}

function waitForJobChanges() {
  const wrapper = document.querySelector(".jobs-search__job-details--wrapper");
  if (!wrapper) return;
  
  const observer = new MutationObserver(() => {
    // clear flag so keywords are re-applied on next job click
    const jobContent = document.querySelector("#job-details");
    if (jobContent) delete jobContent.dataset.keywordsHighlighted;
    setTimeout(handleJobDescriptionChange, 100);
  });
  
  observer.observe(wrapper, { childList: true, subtree: true });
  handleJobDescriptionChange(); // initial run
}

window.addEventListener("load", async () => {
  // Load company list first
  await loadSponsorshipCompanies();
  
  // Wait until LinkedIn fully renders job details
  const checkInterval = setInterval(() => {
    const wrapper = document.querySelector(".jobs-search__job-details--wrapper");
    if (wrapper) {
      clearInterval(checkInterval);
      waitForJobChanges();
    }
  }, 500);
});
