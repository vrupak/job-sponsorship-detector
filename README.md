# LinkedIn Sponsorship Keyword Highlighter Extension

This Chrome extension highlights visa sponsorship-related keywords (e.g., H1B, Visa, Green Card) inside LinkedIn job descriptions. It works even when job descriptions are dynamically loaded without page refresh.

---

## Features

* Detects and highlights keywords like `H1B`, `visa`, `sponsorship`, etc.
* Green background with black text for clear visibility
* Automatically works as you browse different job listings
* Optimized to avoid freezing or unnecessary DOM re-renders

---

## Setup & Installation

1. **Download or clone** this repo to your computer:

   ```bash
   git clone https://github.com/your-username/linkedin-sponsorship-highlighter.git
   ```

2. **Open Chrome** and go to:

   ```
   chrome://extensions
   ```

3. **Enable Developer Mode** (top-right toggle)

4. Click **"Load unpacked"** and select the `linkedin-sponsorship-highlighter/` folder

5. Navigate to any LinkedIn job page and click a job listing — keywords should automatically be highlighted in green.

---

## How It Works

* Uses a MutationObserver to detect when new job descriptions are loaded
* Uses a TreeWalker to efficiently scan and highlight only the relevant text nodes
* Ensures keywords are only highlighted once per load using a flag

---

## Known Limitations

* Doesn’t work outside LinkedIn job pages
* Doesn’t currently support saving custom keywords (planned feature)

---
