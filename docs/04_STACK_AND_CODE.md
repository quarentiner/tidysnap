# Stack And Code

## Stack

TidySnap uses:

- HTML
- CSS
- JavaScript ES modules
- Node.js local backend route
- Netlify Functions for hosted backend routes
- `heic-convert` for HEIC to JPEG conversion
- optional Tally feedback link through public site config
- optional Google Analytics 4 tracking through public site config
- Node.js built-in test runner

The only npm runtime dependency is `heic-convert`.

## Why This Stack Was Chosen

This is an MVP.

The goal is to make the product easy to run, read, and test.

The app has a small install step because HEIC conversion needs `heic-convert`.

## Commands

Install dependencies:

```bash
npm install
```

PowerShell fallback:

```bash
npm.cmd install
```

Run the app:

```bash
npm start
```

PowerShell fallback:

```bash
npm.cmd start
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

## Code Layout

```text
Clutter_Cleanup_Pipeline_Prompts_Updated.md
netlify.toml

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
    env.js
    httpUtils.js
    imageEditor.js
    imageValidator.js
    imageNormalizer.js
    openaiOrganizer.js
    promptTemplates.js
    rateLimit.js
    siteConfig.js

  utils/
    dom.js

netlify/
  functions/
    analyze-image.mjs
    generate-clean-preview.mjs
    site-config.mjs
```

## Module Duties

`src/app.js`

- owns browser events
- handles upload
- calls analysis
- tracks completed actions
- re-renders the result

`src/components/resultView.js`

- renders all result UI
- binds checklist events

`src/data/rules.js`

- stores scene types
- stores scene labels
- stores classifier keywords
- stores base scores
- stores action points

`src/data/cleanupPromptLibrary.js`

- stores the expandable image-to-image cleanup prompt library
- matches results to cleanup categories
- renders the selected prompt with a style placeholder

`src/services/imageAnalysis.js`

- classifies the scene
- combines season, scoring, recommendations, and gamification
- exposes a future `visionProvider` hook

`src/services/recommendationEngine.js`

- creates exactly 3 actions
- creates what / where / how / after placement details
- creates the professional organizer JSON plan
- creates bin labels
- creates accessory suggestions
- creates organizer zones
- creates before / after preview text

`src/services/scoring.js`

- creates a clean-up score from 1 to 10

`src/services/gamification.js`

- calculates points
- calculates progress
- awards badges
- detects completed-room state

`src/services/season.js`

- infers season from city and date
- supports closet rules

`src/services/fileImage.js`

- reads image width, height, and aspect ratio

`src/services/aiAnalysisClient.js`

- sends image bytes to the backend AI route
- merges the AI organizer plan into the UI result
- sends a second request for Preview Mode when the user asks for it
- refreshes the selected cleanup prompt category from the AI organizer plan

`src/services/siteConfig.js`

- reads public site config from `/api/site-config`
- keeps Tally and GA4 optional for launch

`src/services/analytics.js`

- loads GA4 only when a measurement ID is configured
- tracks app events without sending images or file names

`Clutter_Cleanup_Pipeline_Prompts_Updated.md`

- stores the editable Planner, Editor, and Validator prompts
- stores shared global rules, child content policy, and UI limitations
- is the source of truth for the AI cleanup pipeline prompt language

`src/server/analyzeImageRoute.js`

- handles `POST /api/analyze-image`
- handles `POST /api/generate-clean-preview`
- reads request JSON
- normalizes the image
- calls the OpenAI planner
- calls the image editor only during Preview Mode
- calls the validator only after a Preview Mode image is generated
- stops the pipeline when visible children/babies, baby items, private child identity items, or intimate kids clothing are detected

`src/server/imageNormalizer.js`

- accepts JPG, PNG, WebP, GIF
- converts HEIC / HEIF to JPEG with `heic-convert`

`src/server/openaiOrganizer.js`

- calls the OpenAI Responses API
- requests the strict planner JSON using the project prompt file
- validates the returned planner shape
- converts the planner JSON into exactly 3 UI actions

`src/server/imageEditor.js`

- calls the OpenAI image edits endpoint
- receives the planner JSON
- uses the Editor Prompt from the project prompt file
- only allows keep, move, stack, fold, align, and group actions
- returns a generated cleaned JPEG preview when image editing succeeds

`src/server/imageValidator.js`

- compares the original image, edited image, and planner JSON
- uses the Validator Prompt from the project prompt file
- checks that objects were not added, removed, duplicated, or changed
- checks that the room, layout, lighting, and camera angle stayed consistent
- fails if unsupported child-sensitive content appears

`src/server/promptTemplates.js`

- reads `Clutter_Cleanup_Pipeline_Prompts_Updated.md`
- parses each Markdown section by heading
- builds runtime prompts with city, file name, and planner JSON

`src/server/rateLimit.js`

- caps Fast Mode at 3 requests per IP per 10 minutes by default
- caps Preview Mode at 1 request per IP per 10 minutes by default

`src/server/siteConfig.js`

- exposes safe public config values for feedback and analytics
- accepts only HTTPS feedback URLs and GA4 IDs that start with `G-`

`netlify.toml`

- sets the Netlify build command
- maps `/api/analyze-image` to the Fast Mode function
- maps `/api/generate-clean-preview` to the Preview Mode function
- maps `/api/site-config` to the public config function
- includes the project prompt Markdown file in serverless bundles

`netlify/functions/analyze-image.mjs`

- Netlify wrapper for Fast Mode
- returns planner JSON and UI actions without image editing

`netlify/functions/generate-clean-preview.mjs`

- Netlify wrapper for Preview Mode
- generates the cleaned image and validation result

`netlify/functions/site-config.mjs`

- returns public feedback and analytics config

## Future Backend Option

The MVP includes a small local backend route for AI analysis.

A backend can be added later for:

- user accounts
- saved room history
- stored progress
- image storage
- export history

## Future ML Option

The current classifier can be replaced by a vision model.

The model should return:

- scene type
- confidence
- visible items
- evidence

The recommendation engine can still stay rule-based after AI is added.

That keeps output practical and predictable.
