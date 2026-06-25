# Data Model

## Analysis Result

An analysis result is the main object shown on the results screen.

Example:

```json
{
  "sceneType": "wardrobe",
  "sceneLabel": "Cupboard / wardrobe",
  "cleanlinessScore": 5,
  "topActions": [],
  "suggestedBinLabels": [],
  "plannerResult": {},
  "spatialPlan": {},
  "cleanupPrompt": {},
  "optionalAccessories": [],
  "beforeAfterPreview": {},
  "gamification": {},
  "aiAnalysis": {}
}
```

If the AI route is active, the result can also include:

- `plannerResult` from the strict planner prompt
- `aiAnalysis.cleanedImage` for the generated after-image
- `aiAnalysis.validationResult` for the validator stage
- `unsupportedContent` when visible children/babies, baby items, private child identity items, or intimate kids clothing are detected

## Planner Result

The AI planner returns strict JSON first.

Example:

```json
{
  "status": "ok",
  "reason": null,
  "scene_category": "desk / workstation",
  "inventory": [
    {
      "id": "papers-1",
      "name": "loose papers",
      "category": "Documents",
      "count": 6,
      "visible_location": "center of the desk",
      "preservation_notes": "Keep paper count, color, and size."
    }
  ],
  "organization_plan": [
    {
      "object_id": "papers-1",
      "action": "stack",
      "target_location": "left side of the same desk",
      "constraints": "Do not add a new tray."
    }
  ],
  "must_preserve": ["room", "furniture", "lighting", "camera angle"],
  "forbidden_changes": ["new objects", "new furniture", "new bins"]
}
```

Unsupported child-sensitive content returns:

```json
{
  "status": "error",
  "reason": "unsupported_baby_related_content"
}
```

This includes visible children/babies, baby items, private child identity items, and intimate kids clothing.

Children's clothes-only wardrobe photos are supported when no child/person is visible.

The app also accepts the newer internal reason `unsupported_child_sensitive_content` for compatibility.

## Cleanup Prompt

Each analysis includes a selected image cleanup prompt category.

Example:

```json
{
  "category": {
    "name": "Desk / workstation",
    "scene_pattern": "Work surface clutter with cables, laptop, monitor, papers, notebooks, chargers, bottles, pouches, stationery, and personal items."
  },
  "styleOrMood": "natural, realistic, tidy home",
  "prompt": "Clean and organize this desk/workstation..."
}
```

This prompt is intended for future image-to-image cleanup.

It should preserve the original room, furniture, perspective, lighting, and camera angle.

The current image editor uses the strict planner JSON first. The cleanup prompt library remains available as a category-level guide and future expansion point.

## Spatial Organization Plan

This shape is designed for AI vision later, but the MVP also returns it from rules.

Required format:

```json
{
  "detected_issues": ["List of the top 3 messy areas identified"],
  "organization_plan": [
    {
      "step_number": 1,
      "action": "Clear the item or category from its current location.",
      "destination": "Move it to the suggested zone.",
      "reason": "Why this placement makes sense for daily use."
    }
  ],
  "estimated_time_minutes": 15
}
```

Rules:

- `detected_issues` must have exactly 3 items.
- `organization_plan` must have exactly 3 steps.
- each step must include action, destination, and reason.

## Scene Type

Allowed values:

- `wardrobe`
- `bookshelf`
- `clutter`

## Top Action

Each action has:

- `id`
- `type`
- `title`
- `reason`
- `items`
- `placement`
- `points`

Example:

```json
{
  "id": "move-to-bins",
  "type": "move_to_bins",
  "title": "Move into labeled storage bins",
  "reason": "Free prime cupboard space by boxing low-use or off-season pieces.",
  "items": ["Winter jackets", "Thick sweaters", "Heavy scarves"],
  "placement": {
    "move": ["Winter jackets", "Thick sweaters", "Heavy scarves"],
    "where": "Clear bins on the top shelf, bottom shelf, or back corner.",
    "how": "Fold bulky clothes flat, add one label per bin, and keep similar items together.",
    "after": "Off-season clothes are still easy to find, but they no longer block daily outfits."
  },
  "points": 40
}
```

## Organizer Plan

The organizer plan has 3 zones.

Example:

```json
{
  "title": "Closet organizer map",
  "zones": [
    {
      "name": "Prime zone",
      "place": "Front rail or eye-level shelf",
      "use": "Keep T-shirts, light layers, and daily outfits here."
    }
  ],
  "finalLook": "The front of the cupboard should show one clear daily-use section."
}
```

## Photo Guidance

If the app cannot see enough context, it returns photo guidance.

Example:

```json
{
  "needsBetterPhoto": true,
  "title": "Need a wider photo for a smarter organizer plan",
  "tips": ["Step back and include the full cupboard, shelf, desk, or storage area."]
}
```

## Required Action IDs

The MVP uses these action IDs:

- `keep-visible`
- `move-to-bins`
- `remove-or-store`

The UI depends on these IDs for completion tracking and badges.

## Suggested Bin Labels

Bin labels are short labels for storage.

Wardrobe example:

```json
[
  "Off-season winter clothes",
  "Accessories",
  "Donate / repair"
]
```

Bookshelf example:

```json
[
  "Currently reading",
  "Keep visible",
  "Store / archive",
  "Donate"
]
```

Clutter example:

```json
[
  "Daily tools",
  "Cables and chargers",
  "Paper to scan",
  "Donate or discard"
]
```

## Gamification State

Gamification is calculated from completed actions.

Example:

```json
{
  "totalAvailablePoints": 100,
  "pointsEarned": 70,
  "progressPercent": 70,
  "badges": ["First Sort", "Bin Master"],
  "completed": false
}
```

## Badge Names

Allowed badge names:

- First Sort
- Bin Master
- Shelf Reset
- Closet Win

## Before / After Preview

The MVP has two preview types.

Without the AI image editor, the preview is a simple comparison card with visual blocks and short text.

With the AI image editor, the backend can return `aiAnalysis.cleanedImage`.

The validator can then return:

```json
{
  "status": "pass",
  "issues": [],
  "recommended_fix": null
}
```

If validation fails, the result includes issues and a recommended fix.

Example:

```json
{
  "before": "Mixed clothes and accessories compete for the same easy-reach space.",
  "after": "Current-season clothes stay visible while off-season pieces move into labeled storage."
}
```
