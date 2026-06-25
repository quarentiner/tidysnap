# TidySnap

TidySnap turns a photo of a messy area into a short clean-up plan.

A user uploads or captures a photo of a cupboard, bookshelf, desk, or storage area. The app classifies the scene, gives a clean-up score from 1 to 10, and returns exactly 3 practical actions.

The product is action-first. It does not stop at a visual mockup. It tells the user what to keep visible, what to move into labeled bins, and what to remove, donate, or store elsewhere.

## Why This Matters

Messy spaces are hard to fix when the next step is unclear.

A user may need to:

- decide what should stay visible
- decide what belongs in storage
- separate seasonal items
- group books by priority
- remove broken, duplicate, or unused items
- finish quickly before the task feels too big

TidySnap keeps the clean-up small and finishable.

## How It Works In Simple English

The product follows this flow:

1. User uploads or captures a photo.
2. System reads basic image metadata and file-name clues.
3. If an API key is set, Fast Mode sends the photo to the AI planner.
4. If no API key is set, the app uses local rule-based organization logic.
5. System classifies the scene as cupboard / wardrobe, bookshelf, or general clutter.
6. System gives a clean-up score from 1 to 10.
7. System returns exactly 3 action cards:
   - keep visible now
   - move into labeled storage bins
   - remove, donate, or store elsewhere
8. User checks off each action.
9. User earns points and badges.
10. User can optionally click Generate cleaned preview for Preview Mode.
11. When all 3 actions are done, the app shows a completed-room state.

Important product rule:

The MVP should be honest about its limits.

The app has a local fallback and an AI backend route. Children's clothes-only wardrobe photos are supported. Visible children/babies, baby items, private child identity items, and intimate kids clothing are not supported.

## Key Features

MVP features:

- photo upload
- camera capture on supported devices
- scene classification
- cupboard / wardrobe rules
- bookshelf rules
- general clutter rules
- season-aware closet advice based on selected city
- clean-up score from 1 to 10
- exactly 3 top actions
- labeled storage bin suggestions
- optional accessory suggestions
- before / after potential card
- optional AI-generated cleaned after-image
- optional AI validation status for the generated after-image
- real before / after example photos
- optional Tally feedback link
- optional Google Analytics 4 event tracking
- points for each completed action
- progress bar
- badges:
  - First Sort
  - Bin Master
  - Shelf Reset
  - Closet Win
- completed-room celebration state

## Current Status

This workspace contains a runnable MVP.

It uses local rule-based analysis as fallback. When `OPENAI_API_KEY` is set, Fast Mode returns strict planner JSON first. Preview Mode generates the cleaned after-image and validator status only after the user asks for it.

## Tech Stack Summary

The MVP uses a small web stack:

- HTML for the app shell.
- CSS for the clean responsive UI.
- JavaScript ES modules for app logic.
- Node.js local backend route for AI analysis.
- Netlify Functions for hosted AI routes.
- `heic-convert` for iPhone HEIC photos.
- Node.js built-in test runner for tests.
- One runtime package is required: `heic-convert`.

Why this stack:

- fast to run
- easy to inspect
- small install step
- good for an MVP
- simple to replace with React, Vite, or a backend later

## Suggested Folder Structure

Implemented structure:

```text
Clutter_Cleanup_Pipeline_Prompts_Updated.md
index.html
netlify.toml
package.json

assets/
  before-after/
    before-1.jpg
    clean-1.jpg
    before-3.jpg
    clean-3.jpg

src/
  app.js
  styles.css

  components/
    resultView.js

  data/
    cleanupPromptLibrary.js
    rules.js

  services/
    analytics.js
    aiAnalysisClient.js
    fileImage.js
    gamification.js
    imageAnalysis.js
    recommendationEngine.js
    siteConfig.js
    scoring.js
    season.js

  server/
    analyzeImageRoute.js
    imageEditor.js
    imageNormalizer.js
    imageValidator.js
    openaiOrganizer.js
    promptTemplates.js
    siteConfig.js

netlify/
  functions/
    analyze-image.mjs
    generate-clean-preview.mjs
    site-config.mjs

  utils/
    dom.js

tests/
  aiAnalysisClient.test.js
  imageEditor.test.js
  imageNormalizer.test.js
  imageValidator.test.js
  openaiOrganizer.test.js
  recommendationEngine.test.js
  scoring.test.js

scripts/
  dev-server.mjs
  validate-build.mjs

docs/
  00_PROJECT_REQUIREMENTS.md
  01_PRD.md
  02_ARCHITECTURE.md
  03_DATA_MODEL.md
  04_STACK_AND_CODE.md
  05_TESTING.md
  06_BUILD_LOG.md
  07_DECISIONS.md
  08_HOW_TO_USE.md
```

## What Each System Part Does

Frontend:

- shows one main upload button
- shows the uploaded photo
- shows scene, score, actions, bins, accessories, badges, and progress
- shows Generate cleaned preview after Fast Mode completes
- shows real before / after example photos
- shows a feedback link when `TIDYSNAP_FEEDBACK_URL` is configured
- sends lightweight GA4 events when `TIDYSNAP_GA_MEASUREMENT_ID` is configured
- lets the user mark actions complete

Public rate limits:

- Fast Mode: `3` requests per IP per 10 minutes by default.
- Preview Mode: `1` request per IP per 10 minutes by default.

Optional public launch variables:

```text
TIDYSNAP_FEEDBACK_URL=https://tally.so/r/your-form-id
TIDYSNAP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Image analysis:

- classifies the scene
- uses file-name clues and image shape
- supports a future `visionProvider` hook

Scoring:

- creates a clean-up score from 1 to 10
- keeps scoring separate from recommendations

Recommendation engine:

- returns exactly 3 actions
- handles closet, bookshelf, and clutter rules
- suggests bins and accessories

Gamification:

- calculates points
- calculates progress
- awards badges
- detects completed-room state

## Documentation Index

Read these files in order if you are new to the project:

- [00_PROJECT_REQUIREMENTS.md](docs/00_PROJECT_REQUIREMENTS.md) - product scope, user stories, acceptance criteria, and risks.
- [01_PRD.md](docs/01_PRD.md) - product requirements, flows, and feature behavior.
- [02_ARCHITECTURE.md](docs/02_ARCHITECTURE.md) - system parts, data flow, and future AI hook.
- [03_DATA_MODEL.md](docs/03_DATA_MODEL.md) - result shape, action shape, badges, and sample records.
- [04_STACK_AND_CODE.md](docs/04_STACK_AND_CODE.md) - stack, code layout, module duties, and future backend notes.
- [05_TESTING.md](docs/05_TESTING.md) - test commands, covered cases, and manual QA checklist.
- [06_BUILD_LOG.md](docs/06_BUILD_LOG.md) - build progress log.
- [07_DECISIONS.md](docs/07_DECISIONS.md) - product and technical decision log.
- [08_HOW_TO_USE.md](docs/08_HOW_TO_USE.md) - user guide and troubleshooting.
- [09_AI_API_KEY.md](docs/09_AI_API_KEY.md) - when an AI API key is needed and how to add it safely later.
- [10_CLEANUP_PROMPT_LIBRARY.md](docs/10_CLEANUP_PROMPT_LIBRARY.md) - expandable image cleanup prompt library.
- [AUDIT.md](docs/AUDIT.md) - public launch audit, key safety, rate limits, and remaining risks.

## How To Run Or Use The Project

Required tool:

- Node.js 20 or newer

Install dependencies:

```bash
npm install
```

PowerShell fallback if `npm.ps1` is blocked:

```bash
npm.cmd install
```

Run locally:

```bash
npm start
```

PowerShell fallback if `npm.ps1` is blocked:

```bash
npm.cmd start
```

Then open:

```text
http://localhost:5173
```

Run tests:

```bash
npm test
```

PowerShell fallback:

```bash
npm.cmd test
```

Run build validation:

```bash
npm run build
```

PowerShell fallback:

```bash
npm.cmd run build
```

## Where To Look When Something Breaks

Use this simple debugging path:

1. Upload problem:
   - Check `index.html`.
   - Check `src/app.js`.
   - Check `src/services/fileImage.js`.

2. Scene classification problem:
   - Check `src/services/imageAnalysis.js`.
   - Check keywords in `src/data/rules.js`.

3. Closet season problem:
   - Check `src/services/season.js`.
   - Check wardrobe rules in `src/services/recommendationEngine.js`.

4. Score problem:
   - Check `src/services/scoring.js`.

5. Wrong action count:
   - Check `src/services/recommendationEngine.js`.
   - Tests require exactly 3 actions.

6. Points or badges problem:
   - Check `src/services/gamification.js`.

7. UI rendering problem:
   - Check `src/components/resultView.js`.
   - Check `src/styles.css`.

8. AI planner, image edit, or validation problem:
   - Check `Clutter_Cleanup_Pipeline_Prompts_Updated.md`.
   - Check `netlify/functions/analyze-image.mjs`.
   - Check `netlify/functions/generate-clean-preview.mjs`.
   - Check `src/server/openaiOrganizer.js`.
   - Check `src/server/imageEditor.js`.
   - Check `src/server/imageValidator.js`.
   - Check `docs/09_AI_API_KEY.md`.

## Product Principles

The product should be:

- clear
- practical
- fast
- honest
- action-oriented
- beginner-friendly
- useful even before real AI is added

The most important principle:

Give the user a small clean-up plan they can finish now.
