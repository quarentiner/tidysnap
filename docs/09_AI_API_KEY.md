# AI API Key

## Does TidySnap Need An API Key Today?

Only for real AI analysis.

The app still works without an API key.

It uses local rule-based logic:

- file name clues
- image shape
- selected city
- season rules
- organizing rules

With `OPENAI_API_KEY`, the backend can:

- read the uploaded image
- convert HEIC / HEIF to JPEG
- create a strict planner JSON
- generate a cleaned after-image when the user clicks Generate cleaned preview
- validate the after-image against the original photo and planner JSON in Preview Mode

## When An API Key Is Needed

An API key is needed when TidySnap should truly understand the uploaded photo.

Use AI vision when the app must detect:

- exact visible items
- where items are in the photo
- how full each shelf or zone is
- which items are clothes, books, papers, cables, boxes, or accessories
- a more realistic before / after plan
- image-specific instructions such as "move the red box from the bottom left shelf"

## Important Security Rule

Do not put the API key in browser JavaScript.

Do not ship this in frontend code:

```js
const apiKey = "sk-...";
```

Browser users can inspect frontend code.

## Where To Put The Key

Create this file in the project root:

```text
.env
```

Add:

```text
OPENAI_API_KEY=your_openai_api_key_here
```

There is also a safe template:

```text
.env.example
```

Do not commit `.env`.

The project `.gitignore` excludes `.env` and `.env.local`.

Important:

The key is used by:

```text
POST /api/analyze-image
POST /api/generate-clean-preview
```

Restart the local server after editing `.env`.

The safe pattern is:

```text
Browser app
  -> sends image to your backend
  -> backend calls AI vision API with API key
  -> backend returns scene, items, zones, and actions
  -> browser renders the result
```

## AI Endpoint Shape

Fast Mode endpoint:

```text
POST /api/analyze-image
```

Input:

- image file
- selected city
- optional room type hint

Output:

```json
{
  "ok": true,
  "mode": "fast",
  "source": "openai",
  "converted": true,
  "previewImage": {},
  "plannerResult": {},
  "spatialPlan": {},
  "cleanedImage": null,
  "validationResult": null,
  "unsupportedReason": null
}
```

Preview Mode endpoint:

```text
POST /api/generate-clean-preview
```

Input:

- image file
- planner result from Fast Mode

Output:

```json
{
  "ok": true,
  "mode": "preview",
  "cleanedImage": {},
  "validationResult": {},
  "validationError": ""
}
```

The planner result uses this shape:

```json
{
  "status": "ok",
  "reason": null,
  "scene_category": "desk / workstation",
  "inventory": [],
  "organization_plan": [],
  "must_preserve": [],
  "forbidden_changes": []
}
```

If visible children/babies, baby items, private child identity items, or intimate kids clothing are detected:

```json
{
  "status": "error",
  "reason": "unsupported_baby_related_content"
}
```

Children's clothes-only wardrobe photos are supported when no child/person is visible.

The app also accepts `unsupported_child_sensitive_content` as an equivalent internal reason.

## How It Connects To Current Code

Current frontend file:

- `src/services/imageAnalysis.js`

There is also a local `visionProvider` hook for future internal use.

Local fallback shape:

```js
analyzeImage({
  fileName,
  imageMeta,
  city,
  visionProvider: resultFromBackend
});
```

The recommendation engine can still stay rule-based.

AI should detect what is visible.

Rules should decide what to keep, store, remove, donate, and where to place it.

## Current Backend Flow

The backend has been added.

It does this:

- receive uploaded image
- convert HEIC / HEIF to JPEG
- call the planner through the Responses API in Fast Mode
- return strict planner JSON from Fast Mode
- return a converted JPEG preview to the browser when HEIC was uploaded
- call the image-edit model with the planner JSON only in Preview Mode
- call the validator model only in Preview Mode
- stop when visible children/babies, baby items, private child identity items, or intimate kids clothing are detected
- keep `OPENAI_API_KEY` only on the server

The prompt language comes from:

```text
Clutter_Cleanup_Pipeline_Prompts_Updated.md
```

Edit that file to tune Planner, Editor, Validator, global preservation rules, child content policy, and UI limitations.

Optional image settings:

```text
OPENAI_IMAGE_MODEL=gpt-image-2
OPENAI_IMAGE_QUALITY=low
TIDYSNAP_GENERATE_CLEAN_IMAGE=true
```

Set `TIDYSNAP_GENERATE_CLEAN_IMAGE=false` to disable generated after-images while keeping organizer analysis active.

## Netlify

For Netlify, set `OPENAI_API_KEY` in site environment variables.

The repo includes:

```text
netlify.toml
netlify/functions/analyze-image.mjs
netlify/functions/generate-clean-preview.mjs
```

Netlify redirects:

- `/api/analyze-image` -> Fast Mode function
- `/api/generate-clean-preview` -> Preview Mode function
