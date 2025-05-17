const keywords = [
  "h1b", "visa", "sponsorship", "work permit", "immigration",
  "green card", "OPT", "authorization", "citizen", "resident",
  "H-1B", "authorized"
];

const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");

function highlightText(textNode) {
  const parent = textNode.parentNode;
  if (!parent) return;

  const span = document.createElement("span");
  span.innerHTML = textNode.textContent.replace(keywordRegex, match => {
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
  const matchedKeywords = [];

  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    const matches = node.textContent.match(keywordRegex);
    if (matches) {
      matchedKeywords.push(...matches.map(m => m.toUpperCase()));
      highlightText(node);
    }
  });

  if (matchedKeywords.length > 0) {
    createKeywordBanner(matchedKeywords);
  } else {
    createNoKeywordBanner();
  }
}

function createKeywordBanner(keywordsFound) {
  if (document.getElementById("keyword-alert-banner")) return;

  const banner = document.createElement("div");
  banner.id = "keyword-alert-banner";
  banner.style.cssText = `
    background: #fffbe6;
    color: #000000;
    padding: 12px 16px;
    border-left: 5px solid #faad14;
    border-radius: 6px;
    margin-bottom: 14px;
    font-size: 16px;
    position: relative;
    z-index: 1000;
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
    const jobContent = document.querySelector("#job-details");
    if (jobContent) {
      jobContent.dataset.bannerDismissed = "true";
    }
  };

  const uniqueKeywords = [...new Set(keywordsFound.map(k => k.toUpperCase()))];
  const text = document.createTextNode(`Sponsorship-related terms detected: ${uniqueKeywords.join(", ")}`);
  banner.appendChild(text);
  banner.appendChild(closeBtn);

  const tryInsert = () => {
    const jobDetails = document.querySelector("#job-details");
    if (jobDetails && jobDetails.parentElement) {
      jobDetails.parentElement.insertBefore(banner, jobDetails);
    } else {
      setTimeout(tryInsert, 100);
    }
  };

  tryInsert();
}

function createNoKeywordBanner() {
  const jobContent = document.querySelector("#job-details");
  if (!jobContent || jobContent.dataset.bannerDismissed === "true") return;
  if (document.getElementById("keyword-alert-banner")) return;

  const banner = document.createElement("div");
  banner.id = "keyword-alert-banner";
  banner.style.cssText = `
    background: #e6f7ff;
    color: #000;
    padding: 12px 16px;
    border-left: 5px solid #1890ff;
    border-radius: 6px;
    margin-bottom: 14px;
    font-size: 16px;
    position: relative;
    z-index: 1000;
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

  const text = document.createTextNode(`No sponsorship-related keywords found in this job description.`);
  banner.appendChild(text);
  banner.appendChild(closeBtn);

  jobContent.parentElement.insertBefore(banner, jobContent);
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

        // Reset highlighting and banner ONLY if content changed
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
  const checkInterval = setInterval(() => {
    const wrapper = document.querySelector(".jobs-search__job-details--wrapper");
    if (wrapper) {
      clearInterval(checkInterval);
      waitForJobChanges();
    }
  }, 500);
});
