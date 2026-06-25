# Project Requirements

## Product Name

TidySnap

## Core Idea

User takes or uploads a photo of a messy area.

The app analyzes the image and returns practical organization actions.

The main value is not a pretty mockup. The main value is knowing what to do next.

## Primary Use Cases

1. Cupboard / wardrobe with clothes
2. Bookshelf
3. General clutter, desk, or storage area

## MVP Goals

The MVP must let a user:

- upload or capture a photo
- get a scene type
- get a clean-up score from 1 to 10
- get exactly 3 top actions
- see what to move, where to move it, and how to arrange it
- see suggested labeled storage bins
- see an organizer map for the space
- earn points for completing actions
- see badges
- see a simple before / after potential card
- finish the room by completing all 3 actions

## Required Action Types

Each result must include these 3 actions:

1. What to keep visible now
2. What to move into labeled storage bins
3. What to remove, donate, or store elsewhere

## Closet Requirements

If the scene is a cupboard or wardrobe:

- detect it as cupboard / wardrobe
- use the selected city to infer the season
- keep in-season clothes easy to access
- move off-season clothes into labeled storage
- suggest bins or vacuum bags when useful

Example summer result:

- Keep: T-shirts, light layers, daily outfits
- Store: winter jackets, thick sweaters, heavy scarves

## Bookshelf Requirements

If the scene is a bookshelf:

- detect bookshelves from rules
- suggest keeping high-priority books visible
- suggest moving low-priority books back or into storage
- group books into:
  - currently reading
  - keep visible
  - store / archive

## Gamification Requirements

The app must show:

- points for each action
- clean-up score
- progress bar
- checklist with 3 tasks only
- badges:
  - First Sort
  - Bin Master
  - Shelf Reset
  - Closet Win
- completed-room celebration when all 3 actions are done

## Output Requirements

Each analysis should return:

- scene type
- cleanliness score from 1 to 10
- top 3 actions
- suggested bin labels
- optional accessories
- before / after preview
- AI-generated after-image when `OPENAI_API_KEY` is configured
- validator status for the generated after-image
- organizer zones
- wider-photo guidance when the app cannot see enough context
- gamification points earned
- unsupported message for visible children/babies, baby items, private child identity items, and intimate kids clothing

## Acceptance Criteria

- A user can upload a photo and get a scene classification.
- The app returns a cleanliness score.
- The app returns exactly 3 top actions.
- The app suggests labeled storage bins when relevant.
- The app gamifies completion with points and badges.
- The app shows a basic before / after preview.
- The app can show an AI-generated after-image when the API key is configured.
- The app explains where items should move and how the cleaned space should look.
- The app supports children's clothes-only wardrobe photos.
- The app blocks visible children/babies, baby items, private child identity items, and intimate kids clothing.

## Current MVP Limitation

The app can run without real computer vision.

Without an API key, it uses rules based on:

- file name clues
- image shape
- selected city
- date

With `OPENAI_API_KEY`, the backend uses a planner -> editor -> validator flow.
