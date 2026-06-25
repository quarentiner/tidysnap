# How To Use TidySnap

## Start The App

Run:

```bash
npm start
```

PowerShell fallback:

```bash
npm.cmd start
```

Open:

```text
http://localhost:5173
```

## Analyze A Space

1. Choose a city.
2. Click Upload or capture photo.
3. Pick a photo of a cupboard, bookshelf, desk, or storage area.
4. Read the scene type and clean-up score.
5. Use the action cards to see what to move, where to move it, and how to arrange it.
6. Use the organizer map to set up the cleaned space.
7. Complete the 3 action cards.
8. Watch points, progress, and badges update.

If `OPENAI_API_KEY` is configured, TidySnap can also show:

- the strict planner-based organization result
- a generated cleaned after-image
- a validator pass/fail status for that after-image

Children's clothes-only wardrobe photos are supported.

Not supported:

- visible children or babies
- baby items
- private child identity items
- intimate kids clothing

## If TidySnap Asks For A Wider Photo

Take one more photo from farther away.

Try to include:

- full cupboard, shelf, desk, or storage area
- top and bottom of the space
- side edges
- floor area if items are on the floor
- good light

## Tips For Better MVP Results

Use file names with clear words when the app is using local fallback rules.

Good examples:

- `messy-wardrobe.jpg`
- `bookshelf-reading.jpg`
- `desk-clutter.jpg`

The AI backend does not need file-name clues, but clear photos still help.

## Troubleshooting

If the photo does not appear:

- try another image file
- check that the browser supports the file type

If the photo is from an iPhone and uses HEIC:

- TidySnap converts HEIC / HEIF to JPEG on the backend when the AI route is active
- the app should show the converted JPEG preview when conversion succeeds
- use JPG or PNG if you need the visible preview

If the scene type looks wrong:

- try a clearer file name
- check `src/data/rules.js`
- check `src/services/imageAnalysis.js`

If the score looks wrong:

- check `src/services/scoring.js`

If badges do not update:

- check that action cards are marked complete
- check `src/services/gamification.js`

If the app says the photo is not supported:

- remove visible children/babies, baby items, private child identity items, or intimate kids clothing from the test image
- upload a clothes-only wardrobe, adult room, desk, shelf, cupboard, or storage area photo

## Current Limitation

TidySnap can run without real AI vision.

The AI backend needs `OPENAI_API_KEY`.
