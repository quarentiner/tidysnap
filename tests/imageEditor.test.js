import assert from "node:assert/strict";
import test from "node:test";
import { buildImageEditPrompt, createCleanedImagePreview } from "../src/server/imageEditor.js";

const plannerResult = {
  status: "ok",
  reason: null,
  scene_category: "desk / workstation",
  inventory: [
    {
      id: "papers-1",
      name: "loose papers",
      category: "Documents",
      count: 5,
      visible_location: "center desk surface",
      preservation_notes: "Keep the paper stack visible."
    }
  ],
  organization_plan: [
    {
      object_id: "papers-1",
      action: "stack",
      target_location: "left side of the same desk",
      constraints: "Do not add a new tray."
    }
  ],
  must_preserve: ["desk", "lighting", "camera angle"],
  forbidden_changes: ["new furniture", "new bins"]
};

test("image edit prompt executes only the planner JSON", () => {
  const prompt = buildImageEditPrompt(plannerResult);

  assert.match(prompt, /Execute only the provided organization plan/);
  assert.match(prompt, /Do not redesign the room/);
  assert.match(prompt, /Do not invent containers/);
  assert.match(prompt, /"object_id": "papers-1"/);
  assert.match(prompt, /Children's clothes only/);
  assert.match(prompt, /clothes organizer only if that organizer is already visible/);
});

test("creates cleaned image preview with mocked image edit response", async () => {
  const result = await createCleanedImagePreview({
    imageBuffer: Buffer.from("fake jpeg"),
    mimeType: "image/jpeg",
    fileName: "desk.jpg",
    plannerResult,
    apiKey: "test-key",
    model: "test-image-model",
    fetchImpl: async (url, options) => {
      assert.equal(url, "https://api.openai.com/v1/images/edits");
      assert.equal(options.method, "POST");
      assert.equal(options.headers.authorization, "Bearer test-key");
      assert.ok(options.body instanceof FormData);

      return {
        ok: true,
        json: async () => ({
          data: [{ b64_json: Buffer.from("edited image").toString("base64") }]
        })
      };
    }
  });

  assert.equal(result.mimeType, "image/jpeg");
  assert.equal(result.model, "test-image-model");
  assert.match(result.dataUrl, /^data:image\/jpeg;base64,/);
  assert.match(result.prompt, /Do not create duplicates/);
});
