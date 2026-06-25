import { buildValidatorPrompt as buildValidatorPromptFromFile } from "./promptTemplates.js";

const validatorSchema = {
  name: "tidysnap_image_validation",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      status: {
        type: "string",
        enum: ["pass", "fail"]
      },
      issues: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            type: { type: "string" },
            severity: {
              type: "string",
              enum: ["low", "medium", "high"]
            },
            description: { type: "string" }
          },
          required: ["type", "severity", "description"]
        }
      },
      recommended_fix: {
        type: ["string", "null"]
      }
    },
    required: ["status", "issues", "recommended_fix"]
  }
};

export async function validateCleanedImage({
  originalImageBuffer,
  originalMimeType,
  cleanedImage,
  plannerResult,
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_VALIDATOR_MODEL || process.env.OPENAI_MODEL || "gpt-5.5",
  fetchImpl = fetch
}) {
  if (!apiKey) {
    const error = new Error("OPENAI_API_KEY is missing.");
    error.code = "OPENAI_API_KEY_MISSING";
    throw error;
  }

  if (!cleanedImage?.dataUrl) {
    const error = new Error("Cleaned image is missing.");
    error.code = "CLEANED_IMAGE_MISSING";
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
              text: buildValidatorPrompt(plannerResult)
            },
            {
              type: "input_text",
              text: "Original image:"
            },
            {
              type: "input_image",
              image_url: `data:${originalMimeType};base64,${originalImageBuffer.toString("base64")}`
            },
            {
              type: "input_text",
              text: "Edited image:"
            },
            {
              type: "input_image",
              image_url: cleanedImage.dataUrl
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          ...validatorSchema
        }
      }
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error?.message || "OpenAI image validation failed.");
    error.code = payload.error?.code || "OPENAI_VALIDATION_FAILED";
    error.statusCode = response.status;
    throw error;
  }

  return parseValidationResult(payload);
}

export function validateValidationResult(result) {
  if (!result || typeof result !== "object") {
    return false;
  }

  if (result.status !== "pass" && result.status !== "fail") {
    return false;
  }

  if (!Array.isArray(result.issues)) {
    return false;
  }

  if (!result.issues.every(isValidIssue)) {
    return false;
  }

  return result.recommended_fix === null || typeof result.recommended_fix === "string";
}

export function buildValidatorPrompt(plannerResult) {
  return buildValidatorPromptFromFile({ plannerResult });
}

function parseValidationResult(payload) {
  const text = payload.output_text || extractOutputText(payload);
  if (!text) {
    const error = new Error("OpenAI returned no validation result.");
    error.code = "OPENAI_VALIDATION_EMPTY";
    throw error;
  }

  let result;
  try {
    result = JSON.parse(text);
  } catch {
    const error = new Error("OpenAI returned invalid validation JSON.");
    error.code = "OPENAI_VALIDATION_INVALID_JSON";
    throw error;
  }

  if (!validateValidationResult(result)) {
    const error = new Error("OpenAI validation JSON did not match the expected shape.");
    error.code = "OPENAI_VALIDATION_SCHEMA_MISMATCH";
    throw error;
  }

  return result;
}

function extractOutputText(payload) {
  return payload.output
    ?.flatMap((item) => item.content || [])
    ?.find((content) => content.type === "output_text" || content.type === "text")
    ?.text;
}

function isValidIssue(issue) {
  return issue &&
    typeof issue.type === "string" &&
    ["low", "medium", "high"].includes(issue.severity) &&
    typeof issue.description === "string";
}
