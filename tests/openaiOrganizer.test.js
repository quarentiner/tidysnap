import assert from "node:assert/strict";
import test from "node:test";
import {
  createOpenAIOrganizerPlan,
  isUnsupportedPlan,
  plannerResultToSpatialPlan,
  validateOrganizerPlan
} from "../src/server/openaiOrganizer.js";

const validPlannerResult = {
  status: "ok",
  reason: null,
  scene_category: "desk / workstation",
  inventory: [
    {
      id: "papers-1",
      name: "loose papers",
      category: "Documents",
      count: 6,
      visible_location: "center of the desk",
      preservation_notes: "Keep paper stack identity and approximate size."
    },
    {
      id: "cables-1",
      name: "charging cables",
      category: "Electronics",
      count: 2,
      visible_location: "right side of the desk",
      preservation_notes: "Keep cable color and length visible."
    },
    {
      id: "tools-1",
      name: "small desk tools",
      category: "Daily tools",
      count: 4,
      visible_location: "near the keyboard",
      preservation_notes: "Do not merge the separate tools."
    }
  ],
  organization_plan: [
    {
      object_id: "papers-1",
      action: "stack",
      target_location: "one neat stack on the left desk corner",
      constraints: "Keep the papers visible and preserve the stack size."
    },
    {
      object_id: "cables-1",
      action: "group",
      target_location: "existing right-side drawer opening",
      constraints: "Do not invent a cable box."
    },
    {
      object_id: "tools-1",
      action: "align",
      target_location: "small clear zone beside the keyboard",
      constraints: "Keep daily tools reachable."
    }
  ],
  must_preserve: [
    "desk",
    "camera angle",
    "lighting"
  ],
  forbidden_changes: [
    "new bins",
    "new furniture"
  ]
};

test("validates the planner result shape", () => {
  assert.equal(validateOrganizerPlan(validPlannerResult), true);
  assert.equal(validateOrganizerPlan({ status: "error", reason: "unsupported_child_sensitive_content" }), true);
  assert.equal(isUnsupportedPlan({ status: "error", reason: "unsupported_child_sensitive_content" }), true);
  assert.equal(validateOrganizerPlan({ status: "error", reason: "unsupported_baby_related_content" }), true);
  assert.equal(isUnsupportedPlan({ status: "error", reason: "unsupported_baby_related_content" }), true);
  assert.equal(validateOrganizerPlan({ ...validPlannerResult, organization_plan: [] }), false);
  assert.equal(validateOrganizerPlan({ ...validPlannerResult, organization_plan: [{ action: "delete" }] }), false);
});

test("derives exactly three spatial actions from planner JSON", () => {
  const spatialPlan = plannerResultToSpatialPlan(validPlannerResult);

  assert.equal(spatialPlan.detected_issues.length, 3);
  assert.equal(spatialPlan.organization_plan.length, 3);
  assert.match(spatialPlan.organization_plan[0].action, /Stack loose papers/);
  assert.match(spatialPlan.organization_plan[1].destination, /drawer/);
  assert.equal(spatialPlan.organization_plan[2].step_number, 3);
});

test("derives unsupported spatial plan for child-sensitive content", () => {
  const spatialPlan = plannerResultToSpatialPlan({
    status: "error",
    reason: "unsupported_child_sensitive_content"
  });

  assert.equal(spatialPlan.detected_issues.length, 3);
  assert.equal(spatialPlan.organization_plan.length, 3);
  assert.match(spatialPlan.detected_issues.join(" "), /child-sensitive/i);
  assert.match(spatialPlan.detected_issues.join(" "), /clothes-only wardrobe photos are supported/i);
  assert.equal(spatialPlan.estimated_time_minutes, 0);
});

test("creates a planner result with a mocked OpenAI response", async () => {
  const plan = await createOpenAIOrganizerPlan({
    imageBuffer: Buffer.from("fake image"),
    mimeType: "image/jpeg",
    city: "Mumbai",
    fileName: "desk.jpg",
    apiKey: "test-key",
    model: "test-model",
    fetchImpl: async (url, options) => {
      const body = JSON.parse(options.body);

      assert.equal(url, "https://api.openai.com/v1/responses");
      assert.equal(options.headers.authorization, "Bearer test-key");
      assert.equal(body.model, "test-model");
      assert.equal(body.input[0].content[1].type, "input_image");
      assert.match(body.input[0].content[1].image_url, /^data:image\/jpeg;base64,/);
      assert.equal(body.text.format.type, "json_schema");
      assert.match(body.input[0].content[0].text, /Optional vessel organizer rule/);
      assert.match(body.input[0].content[0].text, /Children's clothes only/);

      return {
        ok: true,
        json: async () => ({ output_text: JSON.stringify(validPlannerResult) })
      };
    }
  });

  assert.deepEqual(plan, validPlannerResult);
});
