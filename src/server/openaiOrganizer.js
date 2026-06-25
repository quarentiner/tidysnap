import { buildPlannerPrompt } from "./promptTemplates.js";

const allowedPlanActions = new Set(["keep", "move", "stack", "fold", "align", "group"]);
const unsupportedReason = "unsupported_child_sensitive_content";
const legacyUnsupportedReason = "unsupported_baby_related_content";

const plannerSchema = {
  name: "tidysnap_planner_result",
  strict: false,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      status: { type: "string", enum: ["ok", "error"] },
      reason: { type: ["string", "null"] },
      scene_category: { type: "string" },
      inventory: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            category: { type: "string" },
            count: { type: "number" },
            visible_location: { type: "string" },
            preservation_notes: { type: "string" }
          },
          required: ["id", "name", "category", "count", "visible_location", "preservation_notes"]
        }
      },
      organization_plan: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            object_id: { type: "string" },
            action: { type: "string", enum: [...allowedPlanActions] },
            target_location: { type: "string" },
            constraints: { type: "string" }
          },
          required: ["object_id", "action", "target_location", "constraints"]
        }
      },
      must_preserve: {
        type: "array",
        items: { type: "string" }
      },
      forbidden_changes: {
        type: "array",
        items: { type: "string" }
      }
    },
    required: ["status", "reason"]
  }
};

export async function createOpenAIOrganizerPlan({
  imageBuffer,
  mimeType,
  city,
  fileName,
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_MODEL || "gpt-5.5",
  fetchImpl = fetch
}) {
  if (!apiKey) {
    const error = new Error("OPENAI_API_KEY is missing.");
    error.code = "OPENAI_API_KEY_MISSING";
    throw error;
  }

  const response = await fetchImpl("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildPlannerPrompt({ city, fileName })
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${imageBuffer.toString("base64")}`
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          ...plannerSchema
        }
      }
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error?.message || "OpenAI image analysis failed.");
    error.code = payload.error?.code || "OPENAI_REQUEST_FAILED";
    error.statusCode = response.status;
    throw error;
  }

  return parseOrganizerPlan(payload);
}

export function validateOrganizerPlan(plan) {
  if (!plan || typeof plan !== "object") {
    return false;
  }

  if (isUnsupportedPlan(plan)) {
    return true;
  }

  if (plan.status !== "ok" || plan.reason !== null) {
    return false;
  }

  if (typeof plan.scene_category !== "string" || !plan.scene_category.trim()) {
    return false;
  }

  if (!Array.isArray(plan.inventory) || !plan.inventory.every(isValidInventoryItem)) {
    return false;
  }

  if (!Array.isArray(plan.organization_plan) || !plan.organization_plan.every(isValidOrganizationStep)) {
    return false;
  }

  if (!Array.isArray(plan.must_preserve) || !plan.must_preserve.every(isString)) {
    return false;
  }

  if (!Array.isArray(plan.forbidden_changes) || !plan.forbidden_changes.every(isString)) {
    return false;
  }

  return plan.organization_plan.length > 0;
}

export function isUnsupportedPlan(plan) {
  return plan?.status === "error" &&
    (plan.reason === unsupportedReason || plan.reason === legacyUnsupportedReason);
}

export function plannerResultToSpatialPlan(plan) {
  if (isUnsupportedPlan(plan)) {
    return unsupportedSpatialPlan();
  }

  const inventoryById = new Map(plan.inventory.map((item) => [item.id, item]));
  const selectedSteps = plan.organization_plan.slice(0, 3);
  const issues = ensureThree(
    selectedSteps.map((step) => {
      const item = inventoryById.get(step.object_id);
      return item
        ? `${capitalize(item.name)} is visible at ${item.visible_location}.`
        : `${capitalize(step.object_id)} needs a clearer storage decision.`;
    }),
    [
      "Loose items need to be grouped by category.",
      "Daily-use items need one visible home.",
      "Less-used items should move to visible storage anchors."
    ]
  );

  const organizationPlan = ensureThree(
    selectedSteps.map((step, index) => {
      const item = inventoryById.get(step.object_id);
      const objectName = item?.name || step.object_id || "visible items";
      const visibleLocation = item?.visible_location || "their current spot";

      return {
        step_number: index + 1,
        action: `${actionVerb(step.action)} ${objectName} from ${visibleLocation}.`,
        destination: step.target_location,
        reason: step.constraints
      };
    }),
    [
      {
        action: "Group remaining loose items by category.",
        destination: "Use the nearest visible shelf, drawer, tabletop zone, or cabinet section.",
        reason: "Grouped items are easier to place without changing the room."
      },
      {
        action: "Align frequently used items in one easy-reach zone.",
        destination: "Keep them on the most accessible visible surface.",
        reason: "Daily-use items should stay visible but not scattered."
      },
      {
        action: "Move low-priority items into the best existing storage anchor.",
        destination: "Use an already visible drawer, shelf, bin, or cabinet.",
        reason: "This clears the main surface while preserving every object."
      }
    ]
  ).map((step, index) => ({
    step_number: index + 1,
    action: step.action,
    destination: step.destination,
    reason: step.reason
  }));

  return {
    detected_issues: issues,
    organization_plan: organizationPlan,
    estimated_time_minutes: estimateMinutes(plan)
  };
}

function parseOrganizerPlan(payload) {
  const text = payload.output_text || extractOutputText(payload);
  if (!text) {
    const error = new Error("OpenAI returned no organization plan.");
    error.code = "OPENAI_EMPTY_RESPONSE";
    throw error;
  }

  let plan;
  try {
    plan = JSON.parse(text);
  } catch {
    const error = new Error("OpenAI returned invalid JSON.");
    error.code = "OPENAI_INVALID_JSON";
    throw error;
  }

  if (!validateOrganizerPlan(plan)) {
    const error = new Error("OpenAI JSON did not match the planner shape.");
    error.code = "OPENAI_SCHEMA_MISMATCH";
    throw error;
  }

  return plan;
}

function extractOutputText(payload) {
  return payload.output
    ?.flatMap((item) => item.content || [])
    ?.find((content) => content.type === "output_text" || content.type === "text")
    ?.text;
}

function isValidInventoryItem(item) {
  return item &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.category === "string" &&
    typeof item.count === "number" &&
    typeof item.visible_location === "string" &&
    typeof item.preservation_notes === "string";
}

function isValidOrganizationStep(step) {
  return step &&
    typeof step.object_id === "string" &&
    allowedPlanActions.has(step.action) &&
    typeof step.target_location === "string" &&
    typeof step.constraints === "string";
}

function isString(value) {
  return typeof value === "string";
}

function ensureThree(values, fallbackValues) {
  const result = values.filter(Boolean).slice(0, 3);
  for (const fallback of fallbackValues) {
    if (result.length >= 3) {
      break;
    }
    result.push(fallback);
  }
  return result.slice(0, 3);
}

function actionVerb(action) {
  return {
    keep: "Keep",
    move: "Move",
    stack: "Stack",
    fold: "Fold",
    align: "Align",
    group: "Group"
  }[action] || "Organize";
}

function capitalize(value) {
  const text = String(value || "").trim();
  return text ? `${text[0].toUpperCase()}${text.slice(1)}` : "Visible item";
}

function estimateMinutes(plan) {
  const stepMinutes = Math.max(3, Math.min(3, plan.organization_plan.length)) * 4;
  const inventoryMinutes = Math.min(18, Math.ceil(plan.inventory.length / 3) * 3);
  return Math.min(45, Math.max(10, stepMinutes + inventoryMinutes));
}

function unsupportedSpatialPlan() {
  return {
    detected_issues: [
      "This photo includes unsupported child-sensitive content.",
      "TidySnap does not support visible children, baby items, private child identity items, or intimate kids clothing.",
      "Children's clothes-only wardrobe photos are supported when no child or person is visible."
    ],
    organization_plan: [
      {
        step_number: 1,
        action: "Upload a different photo without visible children, baby items, or private child-sensitive items.",
        destination: "Choose a clothes-only wardrobe, shelf, cupboard, desk, or storage area photo.",
        reason: "This MVP supports clothes-only storage photos, but blocks sensitive child-related content."
      },
      {
        step_number: 2,
        action: "Keep the scene focused on storage, clothing, shelves, drawers, bins, cabinets, or tabletop zones.",
        destination: "Show only the organizing area and avoid personal child identifiers.",
        reason: "Visible storage anchors help the planner create safe move instructions."
      },
      {
        step_number: 3,
        action: "Retake the photo from farther away if storage zones are missing.",
        destination: "Include the whole cupboard, shelf, desk, or storage area.",
        reason: "A wider photo gives the organizer enough context."
      }
    ],
    estimated_time_minutes: 0
  };
}
