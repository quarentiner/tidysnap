# Architecture

## Simple Overview

TidySnap is a browser app with separate logic modules.

The UI asks for a photo.

The analysis layer classifies the scene.

The scoring layer creates a score.

The recommendation layer creates exactly 3 actions.

The gamification layer tracks progress, points, badges, and completion.

## Data Flow

```text
Photo upload
  -> image metadata read
  -> scene classification
  -> season lookup
  -> cleanliness scoring
  -> recommendation engine
  -> optional AI planner
  -> organizer map
  -> gamification plan
  -> results screen
  -> optional user-triggered Preview Mode
  -> optional AI image editor
  -> optional AI validator
```

When `OPENAI_API_KEY` is set, the backend route can run this stricter AI flow:

```text
Browser image upload
  -> POST /api/analyze-image
  -> HEIC to JPEG conversion when needed
  -> planner JSON
  -> browser renders actions
  -> user clicks Generate cleaned preview
  -> POST /api/generate-clean-preview
  -> editor receives planner JSON plus image
  -> validator compares original, edit, and planner JSON
  -> browser renders after-image and validation status
```

If visible children/babies, baby items, private child identity items, or intimate kids clothing are detected, the AI flow returns an unsupported status and does not generate a cleaned image.

Children's clothes-only wardrobe photos are supported when no child/person is visible.

## System Parts

### App Shell

Files:

- `index.html`
- `src/app.js`
- `src/styles.css`

Responsibility:

- show upload controls
- show photo preview
- call analysis logic
- render the result
- update completion state

### Result View

File:

- `src/components/resultView.js`

Responsibility:

- render scene result
- render clean-up score
- render progress bar
- render 3 action cards
- render move / where / how / after details
- render organizer map
- render wider-photo prompt when useful
- render unsupported child-sensitive content note
- render generated after-image when available
- render validator status when available
- render Preview Mode button after Fast Mode completes
- render bin labels
- render accessories
- render before / after potential
- render badges

### Image Analysis

File:

- `src/services/imageAnalysis.js`

Responsibility:

- classify scene type
- build the full analysis result
- provide a `visionProvider` hook for future AI

The current classifier uses:

- file name keywords
- image aspect ratio
- fallback to general clutter

### Season Logic

File:

- `src/services/season.js`

Responsibility:

- infer season from selected city and date
- support closet recommendations

### Scoring

File:

- `src/services/scoring.js`

Responsibility:

- return a score from 1 to 10
- keep scoring independent from UI and recommendations

### Recommendation Engine

File:

- `src/services/recommendationEngine.js`

Responsibility:

- return exactly 3 actions
- return placement details for each action
- return organizer zones
- suggest bin labels
- suggest optional accessories
- return before / after potential text

### Gamification

File:

- `src/services/gamification.js`

Responsibility:

- calculate points
- calculate progress percent
- award badges
- detect completed-room state

## Future AI Hook

The function `analyzeImage` accepts an optional `visionProvider`.

The production MVP also has a backend AI route.

Files:

- `src/server/analyzeImageRoute.js`
- `src/server/openaiOrganizer.js`
- `src/server/imageEditor.js`
- `src/server/imageValidator.js`
- `netlify/functions/analyze-image.mjs`
- `netlify/functions/generate-clean-preview.mjs`

The backend route is used for real image understanding and optional image editing. The local rule-based analysis remains the fallback.

Future shape:

```js
analyzeImage({
  fileName,
  imageMeta,
  city,
  visionProvider: asyncVisionClassifier
});
```

The future provider can return:

```js
{
  sceneType: "wardrobe",
  confidence: 0.91,
  evidence: ["Detected clothes", "Detected closet shelves"]
}
```

This lets the MVP keep the same UI and recommendation engine when real AI is added.

## Storage

The MVP has no backend storage.

Current state is kept in browser memory only.

Future storage could save:

- uploaded photo metadata
- analysis result
- completed actions
- points
- badges
- room history

## Security And Privacy Notes

The current MVP runs locally and can call the local backend route.

When `OPENAI_API_KEY` is not set, it uses local rules.

When `OPENAI_API_KEY` is set, uploaded photos are sent from the local backend to OpenAI for planner, editor, and validator calls.

The API key stays server-side in `.env`.
