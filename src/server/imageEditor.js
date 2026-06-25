import { buildEditorPrompt } from "./promptTemplates.js";

export async function createCleanedImagePreview({
  imageBuffer,
  mimeType,
  fileName,
  plannerResult,
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
  fetchImpl = fetch
}) {
  if (!apiKey) {
    const error = new Error("OPENAI_API_KEY is missing.");
    error.code = "OPENAI_API_KEY_MISSING";
    throw error;
  }

  if (plannerResult?.status !== "ok") {
    const error = new Error("Cleaned image generation requires a supported planner result.");
    error.code = "UNSUPPORTED_PLANNER_RESULT";
    throw error;
  }

  const prompt = buildImageEditPrompt(plannerResult);
  const form = new FormData();
  const inputBlob = new Blob([imageBuffer], { type: mimeType });

  form.append("model", model);
  form.append("image[]", inputBlob, fileNameForMimeType(fileName, mimeType));
  form.append("prompt", prompt);
  form.append("quality", process.env.OPENAI_IMAGE_QUALITY || "low");
  form.append("output_format", "jpeg");

  const response = await fetchImpl("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${apiKey}`
    },
    body: form
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error?.message || "OpenAI image edit failed.");
    error.code = payload.error?.code || "OPENAI_IMAGE_EDIT_FAILED";
    error.statusCode = response.status;
    throw error;
  }

  const base64 = payload.data?.[0]?.b64_json;
  if (!base64) {
    const error = new Error("OpenAI returned no edited image.");
    error.code = "OPENAI_IMAGE_EDIT_EMPTY";
    throw error;
  }

  return {
    mimeType: "image/jpeg",
    dataUrl: `data:image/jpeg;base64,${base64}`,
    model,
    prompt
  };
}

export function buildImageEditPrompt(plannerResult) {
  return buildEditorPrompt({ plannerResult });
}

function fileNameForMimeType(fileName, mimeType) {
  const safeBase = (fileName || "tidysnap-input")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]/gi, "-")
    .slice(0, 48) || "tidysnap-input";

  if (mimeType === "image/png") {
    return `${safeBase}.png`;
  }
  if (mimeType === "image/webp") {
    return `${safeBase}.webp`;
  }

  return `${safeBase}.jpg`;
}
