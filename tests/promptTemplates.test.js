import assert from "node:assert/strict";
import test from "node:test";
import {
  buildEditorPrompt,
  buildPlannerPrompt,
  buildValidatorPrompt,
  extractPromptSections,
  getUiLimitations,
  loadPromptLibrary
} from "../src/server/promptTemplates.js";

const plannerResult = {
  status: "ok",
  reason: null,
  scene_category: "wardrobe",
  inventory: [],
  organization_plan: [
    {
      object_id: "shirt-1",
      action: "fold",
      target_location: "visible wardrobe shelf",
      constraints: "Keep the shirt identity and color."
    }
  ],
  must_preserve: ["wardrobe"],
  forbidden_changes: []
};

test("loads prompt Markdown and extracts required sections", () => {
  const promptLibrary = loadPromptLibrary();
  const sections = promptLibrary.sections;

  assert.match(promptLibrary.markdown, /Clutter Cleanup Pipeline Prompts/);
  assert.ok(sections.global_rules);
  assert.ok(sections.planner_prompt);
  assert.ok(sections.editor_prompt);
  assert.ok(sections.validator_prompt);
  assert.ok(sections.child_content_policy);
  assert.ok(sections.ui_limitations);
});

test("extracts prompt sections from Markdown headings", () => {
  const sections = extractPromptSections(`
## Global Rules
Shared.

---

## 1) Planner Prompt
Plan.

## Child Content Policy
Policy.
`);

  assert.equal(sections.global_rules, "Shared.");
  assert.equal(sections.planner_prompt, "Plan.");
  assert.equal(sections.child_content_policy, "Policy.");
});

test("builds planner prompt from project prompt file plus runtime context", () => {
  const prompt = buildPlannerPrompt({
    city: "Mumbai",
    fileName: "IMG_7292.jpg"
  });

  assert.match(prompt, /Optional vessel organizer rule/);
  assert.match(prompt, /Open shelf rule/);
  assert.match(prompt, /Children's clothes only/);
  assert.match(prompt, /Runtime context/);
  assert.match(prompt, /User city: Mumbai/);
  assert.match(prompt, /Image filename: IMG_7292\.jpg/);
});

test("builds editor and validator prompts from project prompt file", () => {
  const editorPrompt = buildEditorPrompt({ plannerResult });
  const validatorPrompt = buildValidatorPrompt({ plannerResult });

  assert.match(editorPrompt, /Execute only the provided organization plan/);
  assert.match(editorPrompt, /optional vessel organizer or dish rack/);
  assert.match(editorPrompt, /"object_id": "shirt-1"/);
  assert.match(validatorPrompt, /Confirm no new objects were added/);
  assert.match(validatorPrompt, /naturally organized rather than artificially staged/);
  assert.match(validatorPrompt, /"object_id": "shirt-1"/);
});

test("exposes UI limitations from project prompt file", () => {
  const uiLimitations = getUiLimitations();

  assert.match(uiLimitations, /Not supported yet/);
  assert.match(uiLimitations, /Children's clothes-only storage/);
});
