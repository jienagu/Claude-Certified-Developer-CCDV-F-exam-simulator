# Foundations Lab — CCDV-F Practice Simulator

A portable, dependency-free exam practice app for Claude Certified Developer – Foundations preparation. **Independent educational project; not affiliated with or endorsed by Anthropic.** Questions are original, not official exam questions or exam dumps.

Here we go: https://jienagu.github.io/Claude-Certified-Developer-CCDV-F-exam-simulator/ 

## Run immediately

Open `index.html` in a modern browser. No server, API key, npm install, or build is required. All CSS, JavaScript, and questions are bundled in that one file.

For reliable localStorage behavior across browsers, serve the folder locally:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000. Local file storage behavior varies by browser. Storage is specific to the browser and origin, so progress from a local file will not automatically transfer to GitHub Pages.

## Features

- 40 original scenario questions across eight topic areas.
- Study mode with explanations and locked checked answers.
- Timed mock exam with configurable duration and feedback after submission.
- Single-answer and multiple-answer questions; exact-match grading, no partial credit.
- Shuffled questions and answer options; topic filtering and session sizes.
- Question navigation, flags, saved attempts, and refresh recovery.
- Absolute exam deadline: closing the browser does not pause time; expired attempts submit on reopening.
- Topic scores, answer review, missed-question practice, and JSON results export.
- Up to 50 completed attempt summaries stored locally. Only the most recent detailed attempt is retained.
- Responsive interface, semantic form controls, keyboard focus, and no external fonts or trackers.

The default 45-minute limit and 80% study target are personal practice settings, not official exam policies. Scores are raw percentages, not official scaled scores. Question counts and topic proportions do not reproduce the official blueprint. A good practice score does not guarantee passing.

## Publish on GitHub Pages

1. Create a GitHub repository, for example `ccdv-f-simulator`.
2. Extract this ZIP. Upload the **contents** of the `ccdv-f-simulator` folder into the repository root. Ensure `index.html` is at the root, not inside another nested folder.
3. Commit the files to `main`.
4. Open **Settings → Pages → Build and deployment**.
5. Set Source to **Deploy from a branch**. Select **main** and **/ (root)**, then Save.
6. Wait for GitHub's deployment, then open the URL shown in Pages settings.

You may publish only `index.html` and `.nojekyll`, but uploading the full project also shares the editable source.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Alternatively, from this extracted directory, after creating an empty repository:

```sh
git init
git add .
git commit -m "Add CCDV-F practice simulator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ccdv-f-simulator.git
git push -u origin main
```

## Source layout

- `index.html` — ready-to-run standalone app; commit this generated file.
- `src/shell.html` — HTML structure and build markers.
- `src/styles.css` — responsive visual styling.
- `src/questions.js` — editable original question bank and reference links.
- `src/app.js` — session state, timer, navigation, scoring, and review.
- `build.py` — rebuilds standalone HTML using Python's standard library.
- `tests/core.cjs` — dependency-free logic and state tests.
- `tests/smoke.cjs` — optional Playwright browser smoke tests.
- `LICENSE` — MIT license for this original code and question content.

## Customize questions

Edit `RAW` in `src/questions.js`. Each entry has:

```js
[
  'Topic name',
  'Question text',
  ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
  [1], // zero-based correct indexes; [0, 2] means select two
  'Explanation of the correct reasoning.',
  'course' // key in SOURCES
]
```

Then regenerate and commit the bundle:

```sh
python3 build.py
git add src index.html
git commit -m "Update practice content"
```

Keep IDs stable for existing questions. IDs are currently assigned by array position: append new questions instead of reordering the bank. After a breaking question-bank change, change the localStorage KEY in `src/app.js` or use Clear saved data. The All questions option and topic count update automatically.

No automatic build runs on GitHub; rebuild `index.html` before pushing source changes.

## Optional development tests

Run the dependency-free logic checks with Node:

```sh
node tests/core.cjs
```

For optional browser checks, install Playwright (not required to run the app):

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/smoke.cjs
```

Browser tests cover question integrity, feedback and answer locking, save/resume, flags, exact-match scoring, results filters, missed-question sessions, timer expiry on reload, prevention of duplicate submissions, exam feedback concealment, mobile overflow, and browser errors.

## Content scope and sources

Topics: API integration; model optimization; agents and workflows; prompt and context; tools and MCP; security and safety; Claude Code; evaluation and debugging. These are learning categories, not a claim about official exam weights.

Reference review: October 12, 2026. API features and exam scope can change; verify the official documentation before your exam.

- Official preparation course: https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations
- Official certifications and exam guides: https://anthropic-partners.skilljar.com/page/partner-certifications
- Messages API: https://platform.claude.com/docs/en/api/messages
- Tool use: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
- Prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Claude Code permissions: https://code.claude.com/docs/en/permissions
- MCP server concepts: https://modelcontextprotocol.io/docs/learn/server-concepts

## Privacy and limitations

No data is sent anywhere by the simulator. Reference links navigate to external websites when clicked. Progress uses browser localStorage; clearing site data removes it. Export results before clearing if you want to keep a detailed record. Use one active tab per origin; concurrent tabs do not merge attempts. This is a client-side study aid, so answer keys are inspectable in source and the timer is not tamper-resistant. No proctoring, authentication, remote sync, official scoring, or AI-generated live questions are included.

Claude and Anthropic names and marks belong to their respective owners. The MIT license does not grant trademark rights or rights to external documentation.

## Verification for this release

The bundle and dependency-free logic/state tests were checked. Browser automation was unavailable in the creation environment; the included Playwright suite has not been executed for this release. Run it locally for browser interaction and responsive-layout verification.
