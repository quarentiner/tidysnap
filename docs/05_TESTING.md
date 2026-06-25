# Testing

## Test Stack

Tests use the Node.js built-in test runner.

No external test library is required.

## Test Command

Run:

```bash
npm test
```

PowerShell fallback:

```bash
npm.cmd test
```

## Build Validation Command

Run:

```bash
npm run build
```

PowerShell fallback:

```bash
npm.cmd run build
```

This checks that:

- required files exist
- sample analyses return exactly 3 actions
- scores stay between 1 and 10
- bin labels exist
- before / after preview exists

## Current Automated Tests

`tests/openaiOrganizer.test.js`

Checks:

- planner JSON validation
- unsupported child-sensitive content stop state
- planner JSON conversion into exactly 3 UI actions
- OpenAI planner request shape with mocked fetch

`tests/imageEditor.test.js`

Checks:

- editor prompt executes only the planner JSON
- OpenAI image-edit request shape with mocked fetch

`tests/imageValidator.test.js`

Checks:

- validator JSON validation
- validator prompt checks original image, edited image, and planner JSON
- OpenAI validator request shape with mocked fetch

`tests/promptTemplates.test.js`

Checks:

- project prompt Markdown file loads
- Planner, Editor, Validator, Child Content Policy, and UI Limitations sections are parsed
- runtime prompts include city, filename, and planner JSON where needed

`tests/aiAnalysisClient.test.js`

Checks:

- AI organizer success suppresses local HEIC wider-photo warning
- AI organizer can still request a wider photo when its own plan says the image is too close
- AI organizer plan drives checklist cards, labels, and before/after copy
- planner result and validation result are kept in the UI model
- unsupported child-sensitive content is surfaced in the result

`tests/resultView.test.js`

Checks:

- AI clutter results do not show closet season copy
- generated cleaned image preview renders when returned by the backend
- generated image validation status renders
- unsupported child-sensitive content note renders

`tests/cleanupPromptLibrary.test.js`

Checks:

- cleanup prompt library contains 10 expandable categories
- cleanup prompt matching selects desk, shelf, wardrobe, and fallback categories

`tests/imageNormalizer.test.js`

Checks:

- supported image normalization
- unsupported iPhone HEIC preview falls back instead of blocking analysis

`tests/recommendationEngine.test.js`

Checks:

- wardrobe classification
- wardrobe returns exactly 3 actions
- summer closet rules keep T-shirts and store winter clothes
- wardrobe actions include where and how to move items
- professional organizer plan includes exactly 3 issues and 3 steps
- bookshelf classification
- bookshelf groups books into currently reading, visible, and archive buckets
- organizer map returns 3 zones
- weak metadata falls back to general clutter
- low confidence asks for a wider photo
- points and badges are awarded

`tests/scoring.test.js`

Checks:

- score stays between 1 and 10
- bookshelf receives quick-reset score bonus

## Manual QA Checklist

Use this checklist before release:

1. Open the app with `npm start`.
2. Upload a closet or wardrobe photo.
3. Confirm scene type is cupboard / wardrobe.
4. Confirm score is visible.
5. Confirm exactly 3 action cards are visible.
6. Confirm off-season clothes are suggested for bins.
7. Upload a bookshelf photo.
8. Confirm books are grouped into currently reading, keep visible, and store / archive.
9. Upload a desk or clutter photo.
10. Confirm general clutter actions appear.
11. Check all 3 actions.
12. Confirm points reach 100.
13. Confirm progress reaches 100%.
14. Confirm completed-room celebration appears.

## Edge Cases To Test Later

- unknown file names
- very wide images
- very tall images
- mobile camera capture
- city changes after upload
- very small images
- non-image files rejected by browser
- future AI result with low confidence
