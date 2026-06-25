import { readJsonBody, sendJson } from "./httpUtils.js";
import { normalizeImageForVision } from "./imageNormalizer.js";
import { createCleanedImagePreview } from "./imageEditor.js";
import { validateCleanedImage } from "./imageValidator.js";
import {
  createOpenAIOrganizerPlan,
  isUnsupportedPlan,
  plannerResultToSpatialPlan,
  validateOrganizerPlan
} from "./openaiOrganizer.js";

export async function handleAnalyzeImageRequest(request, response) {
  try {
    if (request.method !== "POST") {
      sendJson(response, 405, {
        ok: false,
        error: "Method not allowed."
      });
      return;
    }

    const payload = await analyzeImagePayload(await readJsonBody(request));
    sendJson(response, 200, payload);
  } catch (error) {
    const statusCode = error.statusCode || statusCodeForError(error);
    sendJson(response, statusCode, {
      ok: false,
      code: error.code || "ANALYZE_IMAGE_FAILED",
      error: error.message
    });
  }
}

export async function handleGenerateCleanPreviewRequest(request, response) {
  try {
    if (request.method !== "POST") {
      sendJson(response, 405, {
        ok: false,
        error: "Method not allowed."
      });
      return;
    }

    const payload = await generateCleanPreviewPayload(await readJsonBody(request));
    sendJson(response, 200, payload);
  } catch (error) {
    const statusCode = error.statusCode || statusCodeForError(error);
    sendJson(response, statusCode, {
      ok: false,
      code: error.code || "GENERATE_CLEAN_PREVIEW_FAILED",
      error: error.message
    });
  }
}

export async function analyzeImagePayload(body) {
  validateAnalyzeRequest(body);

  const normalizedImage = await normalizeImageForVision(body);
  const plannerResult = await createOpenAIOrganizerPlan({
    imageBuffer: normalizedImage.buffer,
    mimeType: normalizedImage.mimeType,
    city: body.city,
    fileName: body.fileName
  });
  const spatialPlan = plannerResultToSpatialPlan(plannerResult);
  const plannerUnsupported = isUnsupportedPlan(plannerResult);

  return {
    ok: true,
    mode: "fast",
    source: "openai",
    converted: normalizedImage.converted,
    originalMimeType: normalizedImage.originalMimeType,
    mimeType: normalizedImage.mimeType,
    previewImage: normalizedImage.converted
      ? {
          mimeType: normalizedImage.mimeType,
          dataUrl: `data:${normalizedImage.mimeType};base64,${normalizedImage.buffer.toString("base64")}`
      }
      : null,
    cleanedImage: null,
    cleanedImageError: "",
    validationResult: null,
    validationError: "",
    unsupportedReason: plannerUnsupported ? plannerResult.reason : null,
    plannerResult,
    spatialPlan
  };
}

export async function generateCleanPreviewPayload(body) {
  validatePreviewRequest(body);
  const normalizedImage = await normalizeImageForVision(body);
  const plannerResult = body.plannerResult;

  if (process.env.TIDYSNAP_GENERATE_CLEAN_IMAGE === "false") {
    return {
      ok: true,
      mode: "preview",
      cleanedImage: null,
      cleanedImageError: "Cleaned image generation is disabled.",
      validationResult: null,
      validationError: ""
    };
  }

  try {
    const cleanedImage = await createCleanedImagePreview({
      imageBuffer: normalizedImage.buffer,
      mimeType: normalizedImage.mimeType,
      fileName: body.fileName,
      plannerResult
    });
    const validation = await tryValidateCleanedImage({
      normalizedImage,
      cleanedImage,
      plannerResult
    });

    return {
      ok: true,
      mode: "preview",
      cleanedImage,
      cleanedImageError: "",
      validationResult: validation.result,
      validationError: validation.error
    };
  } catch (error) {
    return {
      ok: true,
      mode: "preview",
      cleanedImage: null,
      cleanedImageError: error.message,
      validationResult: null,
      validationError: ""
    };
  }
}

async function tryValidateCleanedImage({ normalizedImage, cleanedImage, plannerResult }) {
  try {
    const result = await validateCleanedImage({
      originalImageBuffer: normalizedImage.buffer,
      originalMimeType: normalizedImage.mimeType,
      cleanedImage,
      plannerResult
    });

    return {
      result,
      error: ""
    };
  } catch (error) {
    return {
      result: null,
      error: error.message
    };
  }
}

function validateAnalyzeRequest(body) {
  if (!body || typeof body !== "object") {
    const error = new Error("Request must be a JSON object.");
    error.statusCode = 400;
    throw error;
  }

  if (!body.fileName || typeof body.fileName !== "string") {
    const error = new Error("fileName is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!body.base64 || typeof body.base64 !== "string") {
    const error = new Error("base64 image data is required.");
    error.statusCode = 400;
    throw error;
  }
}

function validatePreviewRequest(body) {
  validateAnalyzeRequest(body);

  if (!validateOrganizerPlan(body.plannerResult) || isUnsupportedPlan(body.plannerResult)) {
    const error = new Error("A supported plannerResult is required for preview mode.");
    error.statusCode = 400;
    error.code = "INVALID_PLANNER_RESULT";
    throw error;
  }
}

export function statusCodeForError(error) {
  if (error.code === "OPENAI_API_KEY_MISSING") {
    return 503;
  }

  if (
    error.code === "UNSUPPORTED_IMAGE_TYPE" ||
    error.code === "EMPTY_IMAGE" ||
    error.code === "INVALID_PLANNER_RESULT"
  ) {
    return 400;
  }

  return 500;
}
