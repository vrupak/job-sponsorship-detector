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
    return `<span style="background-color: limegreen; color: black;">${match}</span>`;
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

  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    if (keywordRegex.test(node.textContent)) {
      highlightText(node);
    }
  });
}

function handleJobDescriptionChange() {
  const jobContent = document.querySelector("#job-details");
  if (jobContent && !jobContent.dataset.keywordsHighlighted) {
    requestIdleCallback(() => {
      highlightKeywordsIn(jobContent);
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

window.addEventListener("load", () => {
  // Wait until LinkedIn fully renders job details
  const checkInterval = setInterval(() => {
    const wrapper = document.querySelector(".jobs-search__job-details--wrapper");
    if (wrapper) {
      clearInterval(checkInterval);
      waitForJobChanges();
    }
  }, 500);
});
