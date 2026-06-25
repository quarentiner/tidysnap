# Cleanup Prompt Library

## Purpose

The cleanup prompt library stores reusable image-to-image cleanup prompts for cluttered home interiors.

It is designed to help a future image model create cleaned versions of the same room while preserving:

- room identity
- furniture
- perspective
- lighting
- camera angle
- walls, windows, doors, shelves, beds, desks, and counters

The goal is realistic clean-up, not redesign.

## Current Categories

The first library version includes:

1. Desk / workstation
2. Cabinet / shelf / storage unit
3. Clothes area / wardrobe / hanging clothes
4. Floor clutter
5. Hall / living room
6. Bedroom
7. Table / top surface
8. Balcony / terrace
9. Kitchen counter
10. General new category

## Code Location

Main file:

```text
src/data/cleanupPromptLibrary.js
```

Each category has the same fields:

- `id`
- `name`
- `scene_pattern`
- `prompt_template`
- `organization_rules`
- `keep`
- `remove_or_hide`
- `move_to_storage`
- `style_variants`
- `must_preserve`

## How It Works

The app matches each analysis to a cleanup category.

Matching uses:

- scene type
- file name
- detected issues from the AI organizer plan
- organization steps from the AI organizer plan

The selected cleanup category is rendered in the app as:

- image cleanup direction
- reusable cleanup prompt
- rules
- keep visible decisions
- remove or hide decisions
- move to storage decisions
- must-preserve constraints

## Prompt Rule

Every prompt must preserve the same room.

The prompt should clean, organize, declutter, and lightly restyle only within the original scene.

It should not:

- change camera angle
- change room layout
- invent major furniture
- make the result look staged
- make the room look like a different home

## How To Add A New Category

Append a new category object.

Do not rewrite the whole library.

Use the same fields every time.

Add keywords in `categoryKeywords` only if needed for matching.

Then add or update tests in:

```text
tests/cleanupPromptLibrary.test.js
```
