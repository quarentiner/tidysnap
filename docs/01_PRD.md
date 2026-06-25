# Product Requirements Document

## Summary

TidySnap helps users clean a messy area from one photo.

The app gives a scene type, clean-up score, and 3 concrete actions. The user checks off the actions and earns points and badges.

## Target User

The target user wants a quick organization plan without spending a long time planning.

They may be cleaning:

- a closet
- a bookshelf
- a desk
- a cupboard
- a storage shelf

## Main User Flow

1. User opens TidySnap.
2. User selects a city.
3. User uploads or captures a photo.
4. App uses AI planner output when `OPENAI_API_KEY` is available, otherwise it uses local rules.
5. App classifies the scene.
6. App shows the clean-up score.
7. App shows exactly 3 action cards.
8. User completes each action.
9. App updates points and progress.
10. App awards badges.
11. App shows completed-room celebration.

## Screen Requirements

The MVP has one main screen.

It includes:

- city selector
- upload / capture button
- photo preview
- scene result
- score card
- progress bar
- 3 action cards
- what to move, where to move it, how to arrange it, and what it should look like after
- organizer map with 3 zones
- bin labels
- optional accessories
- before / after potential comparison
- generated after-image when available
- validation status when an after-image is generated
- badges
- completed-room state

## Scene Types

Supported scene types:

- `wardrobe`
- `bookshelf`
- `clutter`

Display labels:

- Cupboard / wardrobe
- Bookshelf
- General clutter / desk / storage

## Action Card Rules

There must always be exactly 3 action cards.

Action 1:

- title: Keep visible now
- purpose: keep current or high-priority items easy to reach
- must include where those items should be placed

Action 2:

- title: Move into labeled storage bins
- purpose: move off-season, low-priority, duplicate, or rare-use items
- must include which bin or shelf zone should receive them

Action 3:

- title: Remove, donate, or store elsewhere
- purpose: remove broken, unused, or low-value clutter
- must include a clear exit place such as donate bag, repair pile, archive box, recycle, or discard

## Organizer Map

Each analysis must include 3 zones.

Examples:

- prime visible zone
- storage zone
- exit zone

The map should explain how the space should look after cleaning.

## Better Photo Prompt

If confidence is low, or if the browser cannot preview the uploaded photo, the app should ask for a wider photo.

The prompt should ask the user to:

- step back
- include the full cupboard, shelf, desk, or storage area
- show top, bottom, sides, and floor area when possible
- use good light

## Clean-Up Score

Score range:

- minimum: 1
- maximum: 10

The score is a simple rule-based estimate in the MVP.

It considers:

- scene type
- scene confidence
- image shape
- large image detail

## Points

Points are tied to the 3 action types:

- Keep visible now: 30 points
- Move into labeled storage bins: 40 points
- Remove, donate, or store elsewhere: 30 points

Total available points:

- 100 points

## Badge Rules

First Sort:

- earned when at least one action is complete

Bin Master:

- earned when the storage-bin action is complete

Shelf Reset:

- earned when all 3 bookshelf actions are complete

Closet Win:

- earned when all 3 wardrobe actions are complete

## Non-Goals For MVP

The MVP does not include:

- user accounts
- saved room history
- user-managed AI billing
- shopping links
- barcode or ISBN lookup
- book review API integration
- visible children/babies, baby items, private child identity items, or intimate kids clothing support

## AI Cleanup Rules

When the AI route is active, the product uses three stages:

1. Planner returns strict JSON.
2. Editor executes only the planner JSON on the original image.
3. Validator checks the edited image against the original and the planner JSON.

The editor may only keep, move, stack, fold, align, or group objects.

It must preserve the original room, furniture, camera angle, lighting, object identity, and object count.

Children's clothes-only wardrobe photos are supported when no child/person is visible.

## Future Features

Possible next features:

- AI vision model for item detection
- real before / after generated preview
- room history
- saved badges
- user preferences
- book priority input
- location from browser permission
- storage shopping list
- reminders
- export checklist
