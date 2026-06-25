# Build Log

## 2026-06-24

Initial MVP built.

Completed:

- created app shell
- added upload and camera capture input
- added photo preview
- added rule-based scene classification
- added closet season logic
- added bookshelf logic
- added general clutter logic
- added clean-up score
- added exactly 3 action cards
- added bin labels
- added optional accessories
- added before / after potential card
- added points and progress bar
- added badges
- added completed-room celebration
- added tests
- added local server
- added build validation
- added documentation
- improved action cards with what to move, where to move it, how to arrange it, and final look
- added organizer map with 3 zones
- added wider-photo prompt for low-confidence or unsupported-preview uploads
- fixed HEIC fallback display so hidden upload states do not overlap
- added professional organizer JSON-style plan with detected issues, destinations, and reasons
- added `POST /api/analyze-image` backend route
- added `OPENAI_API_KEY` loading from `.env`
- added OpenAI vision call through the Responses API
- added HEIC / HEIF conversion to JPEG with `heic-convert`
- suppressed the local wider-photo warning after a successful AI organizer result
- made the HEIC no-preview area compact so results stay in focus
- aligned the checklist cards, labels, and before/after copy with the AI organizer plan instead of the old local fallback
- removed closet season copy from non-closet AI results
- returned the converted JPEG preview for HEIC uploads so the app can display the image after conversion
- added an expandable image cleanup prompt library with 10 categories
- rendered the selected cleanup prompt, rules, keep/hide/storage decisions, and must-preserve constraints in the app
- added OpenAI image-edit generation for cleaned after-image previews
- rendered the generated cleaned image in the result screen when available
- replaced the broad image cleanup request with a strict planner -> editor -> validator flow
- added planner JSON with inventory, allowed cleanup actions, preserve rules, and forbidden changes
- added validation of generated after-images against the original image and planner JSON
- added unsupported handling for visible children/babies, baby items, private child identity items, and intimate kids clothing
- added UI notes for supported children's clothes-only wardrobe photos, unsupported child-sensitive content, and after-image validation status
- refined the planner so children's clothes-only wardrobe photos are allowed when no child/person is visible
- added `Clutter_Cleanup_Pipeline_Prompts_Updated.md` as the editable source of truth for Planner, Editor, and Validator prompts
- added `src/server/promptTemplates.js` to parse the prompt Markdown and inject runtime context
- split AI flow into Fast Mode planner analysis and user-triggered Preview Mode image generation
- added `/api/generate-clean-preview` for cleaned image and validation generation
- added Netlify configuration and functions for hosted Fast Mode and Preview Mode

Known limitation:

- AI image quality depends on the uploaded photo and configured OpenAI models

Next useful build step:

- run real-photo QA with desk, shelf, wardrobe, and general clutter examples
