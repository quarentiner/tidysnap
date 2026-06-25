import assert from "node:assert/strict";
import test from "node:test";
import {
  getCleanupPromptForAnalysis,
  getCleanupPromptLibrary,
  inferCleanupCategoryId
} from "../src/data/cleanupPromptLibrary.js";

test("cleanup prompt library contains required expandable category shape", () => {
  const library = getCleanupPromptLibrary();

  assert.equal(library.categories.length, 10);
  assert.ok(Array.isArray(library.global_rules));
  assert.ok(library.expandable_template.matching_rule);

  for (const category of library.categories) {
    assert.ok(category.id);
    assert.ok(category.name);
    assert.ok(category.scene_pattern);
    assert.ok(category.prompt_template.includes("{style_or_mood}"));
    assert.ok(Array.isArray(category.organization_rules));
    assert.ok(Array.isArray(category.keep));
    assert.ok(Array.isArray(category.remove_or_hide));
    assert.ok(Array.isArray(category.move_to_storage));
    assert.ok(Array.isArray(category.style_variants));
    assert.ok(Array.isArray(category.must_preserve));
  }
});

test("matches desk clutter to desk workstation cleanup prompt", () => {
  const categoryId = inferCleanupCategoryId({
    sceneType: "clutter",
    fileName: "IMG_7286.HEIC",
    spatialPlan: {
      detected_issues: ["Cable clutter around the monitor and laptop area"],
      organization_plan: [
        {
          action: "Clear cables behind the monitor",
          destination: "Move them to a cable box",
          reason: "Keeps the desk safe"
        }
      ]
    }
  });

  assert.equal(categoryId, "desk_workstation");
});

test("renders selected cleanup prompt with style placeholder filled", () => {
  const result = getCleanupPromptForAnalysis({
    sceneType: "wardrobe",
    styleOrMood: "calm and bright"
  });

  assert.equal(result.category.id, "clothes_wardrobe");
  assert.match(result.prompt, /calm and bright/);
  assert.doesNotMatch(result.prompt, /style_or_mood/);
});
