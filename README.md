# LinkedIn Sponsorship Keyword Highlighter Extension

This Chrome extension highlights visa sponsorship-related keywords (e.g., H1B, Visa, Green Card) inside LinkedIn job descriptions. It works even when job descriptions are dynamically loaded without page refresh.

---

## Features

* Detects and highlights keywords like `H1B`, `visa`, `sponsorship`, `OPT`, `CPT`, etc.
* Displays a summary banner indicating detected keywords or absence of sponsorship terms
* Smart detection that refreshes highlights and banner when browsing between job listings
* Green background with black text for keyword visibility
* Automatically works as you browse different job listings

---

## Setup & Installation

1. **Download or clone** this repo to your computer:

   ```bash
   git clone https://github.com/vrupak/job-sponsorship-detector.git
   ```

2. **Open Chrome** and go to:

   ```
   chrome://extensions
   ```

3. **Enable Developer Mode** (top-right toggle)

4. Click **"Load unpacked"** and select the `job-sponsorship-detector/` folder

5. Navigate to any LinkedIn job page and click a job listing — keywords should automatically be highlighted and banner displayed.

---

## How It Works

* Uses a MutationObserver to detect when new job descriptions are loaded
* Uses a TreeWalker to efficiently scan and highlight only the relevant text nodes
* Shows a dismissible banner with detected sponsorship keywords
* Ensures keywords and banners reset with each new job listing

---

## Known Limitations

* Doesn’t work outside LinkedIn job pages
* Doesn’t currently support saving custom keywords (planned feature)

---