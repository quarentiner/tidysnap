import assert from "node:assert/strict";
import test from "node:test";
import { readImageFile } from "../src/services/fileImage.js";
import { analyzeImage, classifyScene } from "../src/services/imageAnalysis.js";
import { getCompletionState } from "../src/services/gamification.js";

test("classifies wardrobe photos and returns exactly three actions", () => {
  const result = analyzeImage({
    fileName: "messy-wardrobe-clothes.jpg",
    fileSize: 500_000,
    imageMeta: { width: 900, height: 1500, aspectRatio: 0.6 },
    city: "New York",
    now: new Date("2026-06-24")
  });

  assert.equal(result.sceneType, "wardrobe");
  assert.equal(result.topActions.length, 3);
  assert.ok(result.topActions[0].items.includes("T-shirts"));
  assert.ok(result.topActions[1].items.includes("Winter jackets"));
  assert.match(result.topActions[1].placement.where, /top shelf|bottom shelf|back corner/);
  assert.match(result.topActions[1].placement.after, /Off-season clothes/);
  assert.equal(result.organizerPlan.zones.length, 3);
  assert.match(result.organizerPlan.finalLook, /front of the cupboard/);
  assert.equal(result.spatialPlan.detected_issues.length, 3);
  assert.equal(result.spatialPlan.organization_plan.length, 3);
  assert.equal(result.cleanupPrompt.category.id, "clothes_wardrobe");
  assert.match(result.spatialPlan.organization_plan[1].destination, /labeled off-season bins/);
  assert.ok(result.suggestedBinLabels.includes("Off-season winter clothes"));
});

test("classifies bookshelves and groups books into reading, visible, and archive buckets", () => {
  const result = analyzeImage({
    fileName: "bookshelf-reading-books.jpg",
    fileSize: 500_000,
    imageMeta: { width: 1200, height: 1000, aspectRatio: 1.2 },
    city: "London",
    now: new Date("2026-06-24")
  });

  const allItems = result.topActions.flatMap((action) => action.items).join(" ").toLowerCase();

  assert.equal(result.sceneType, "bookshelf");
  assert.equal(result.topActions.length, 3);
  assert.match(allItems, /currently reading/);
  assert.match(allItems, /low-priority books/);
  assert.match(result.topActions[0].placement.where, /Eye-level shelf/);
  assert.match(result.organizerPlan.finalLook, /current reading/);
  assert.match(result.spatialPlan.organization_plan[0].action, /currently reading books/);
  assert.equal(result.cleanupPrompt.category.id, "cabinet_shelf_storage");
  assert.match(result.suggestedBinLabels.join(" "), /Store \/ archive/);
});

test("falls back to general clutter when metadata is weak", () => {
  const classification = classifyScene({
    fileName: "photo.jpg",
    imageMeta: { width: 0, height: 0, aspectRatio: 0 }
  });

  assert.equal(classification.sceneType, "clutter");
  assert.equal(classification.confidence, 0.35);
});

test("asks for a wider photo when confidence is low", () => {
  const result = analyzeImage({
    fileName: "photo.jpg",
    fileSize: 500_000,
    imageMeta: { width: 0, height: 0, aspectRatio: 0 },
    city: "Mumbai",
    now: new Date("2026-06-24")
  });

  assert.equal(result.photoGuidance.needsBetterPhoto, true);
  assert.match(result.photoGuidance.title, /wider photo/);
});

test("awards points and badges as actions are completed", () => {
  const result = analyzeImage({
    fileName: "bookshelf.jpg",
    fileSize: 500_000,
    imageMeta: { width: 1200, height: 1000, aspectRatio: 1.2 },
    city: "London",
    now: new Date("2026-06-24")
  });
  const completedIds = new Set(result.topActions.map((action) => action.id));
  const completion = getCompletionState(result.topActions, completedIds, result.sceneType);

  assert.equal(completion.completed, true);
  assert.equal(completion.progressPercent, 100);
  assert.deepEqual(completion.badges, ["First Sort", "Bin Master", "Shelf Reset"]);
});

test("unsupported iPhone image formats still return fallback metadata", async () => {
  const result = await readImageFile(
    { name: "messy-closet.HEIC", type: "image/heic" },
    "blob:unsupported-preview"
  );

  assert.equal(result.previewAvailable, false);
  assert.equal(result.imageMeta.unsupportedPreview, true);
  assert.match(result.warning, /iPhone HEIC photos/);
});
