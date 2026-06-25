import assert from "node:assert/strict";
import test from "node:test";
import {
  buildValidatorPrompt,
  validateCleanedImage,
  validateValidationResult
} from "../src/server/imageValidator.js";

const plannerResult = {
  status: "ok",
  reason: null,
  scene_category: "shelf",
  inventory: [],
  organization_plan: [
    {
      object_id: "books-1",
      action: "align",
      target_location: "same visible shelf",
      constraints: "Do not add or remove books."
    }
  ],
  must_preserve: ["shelf", "lighting"],
  forbidden_changes: ["new furniture"]
};

const passResult = {
  status: "pass",
  issues: [],
  recommended_fix: null
};

test("validates validator JSON shape", () => {
  assert.equal(validateValidationResult(passResult), true);
  assert.equal(validateValidationResult({
    status: "fail",
    issues: [
      {
        type: "new_object_added",
        severity: "high",
        description: "A bin appeared."
      }
    ],
    recommended_fix: "Remove the invented bin."
  }), true);
  assert.equal(validateValidationResult({ status: "pass", issues: "none" }), false);
});

test("validator prompt checks original, edit, and child-sensitive content", () => {
  const prompt = buildValidatorPrompt(plannerResult);

  assert.match(prompt, /Compare the edited image against the original image/);
  assert.match(prompt, /Confirm no new objects were added/);
  assert.match(prompt, /Children's clothes only/);
  assert.match(prompt, /unsupported_baby_related_content/);
  assert.match(prompt, /"object_id": "books-1"/);
});

test("validates cleaned image with mocked OpenAI response", async () => {
  const result = await validateCleanedImage({
    originalImageBuffer: Buffer.from("original"),
    originalMimeType: "image/jpeg",
    cleanedImage: {
      dataUrl: "data:image/jpeg;base64,Y2xlYW4="
    },
    plannerResult,
    apiKey: "test-key",
    model: "test-validator-model",
    fetchImpl: async (url, options) => {
      const body = JSON.parse(options.body);

      assert.equal(url, "https://api.openai.com/v1/responses");
      assert.equal(options.headers.authorization, "Bearer test-key");
      assert.equal(body.model, "test-validator-model");
      assert.match(body.input[0].content[2].image_url, /^data:image\/jpeg;base64,/);
      assert.match(body.input[0].content[4].image_url, /^data:image\/jpeg;base64,/);
      assert.equal(body.text.format.type, "json_schema");

      return {
        ok: true,
        json: async () => ({ output_text: JSON.stringify(passResult) })
      };
    }
  });

  assert.deepEqual(result, passResult);
});
