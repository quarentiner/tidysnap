import { pointsByAction } from "../data/rules.js";
import { getCleanupPromptForAnalysis } from "../data/cleanupPromptLibrary.js";

const unsupportedContentReasons = new Set([
  "unsupported_child_sensitive_content",
  "unsupported_baby_related_content"
]);

export async function requestAIOrganizationPlan(file, city, sceneType = "clutter") {
  const base64 = await readFileAsBase64(file);
  const response = await fetch("/api/analyze-image", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      city,
      sceneType,
      base64
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    const error = new Error(payload.error || "AI image analysis failed.");
    error.code = payload.code || "AI_ANALYSIS_FAILED";
    throw error;
  }

  return payload;
}

export async function requestCleanedPreview(file, plannerResult) {
  const base64 = await readFileAsBase64(file);
  const response = await fetch("/api/generate-clean-preview", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      base64,
      plannerResult
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    const error = new Error(payload.error || "AI cleaned preview failed.");
    error.code = payload.code || "AI_PREVIEW_FAILED";
    throw error;
  }

  return payload;
}

export function applyAIOrganizationPlan(result, aiPayload) {
  const aiTopActions = buildTopActionsFromSpatialPlan(aiPayload.spatialPlan);
  const unsupportedContent = buildUnsupportedContent(aiPayload);

  return {
    ...result,
    plannerResult: aiPayload.plannerResult || null,
    spatialPlan: aiPayload.spatialPlan,
    cleanupPrompt: getCleanupPromptForAnalysis({
      sceneType: result.sceneType,
      fileName: result.image?.fileName || "",
      spatialPlan: aiPayload.spatialPlan
    }),
    topActions: aiTopActions,
    suggestedBinLabels: buildLabelsFromSpatialPlan(aiPayload.spatialPlan),
    beforeAfterPreview: buildBeforeAfterFromSpatialPlan(aiPayload.spatialPlan),
    photoGuidance: buildAIPhotoGuidance(aiPayload.spatialPlan),
    aiAnalysis: {
      source: aiPayload.source,
      mode: aiPayload.mode || "fast",
      converted: aiPayload.converted,
      originalMimeType: aiPayload.originalMimeType,
      mimeType: aiPayload.mimeType,
      previewImage: aiPayload.previewImage || null,
      cleanedImage: aiPayload.cleanedImage || null,
      cleanedImageError: aiPayload.cleanedImageError || "",
      validationResult: aiPayload.validationResult || null,
      validationError: aiPayload.validationError || "",
      unsupportedReason: aiPayload.unsupportedReason || ""
    },
    unsupportedContent
  };
}

export function applyCleanedPreviewResult(result, previewPayload) {
  return {
    ...result,
    aiAnalysis: {
      ...(result.aiAnalysis || {}),
      mode: previewPayload.mode || "preview",
      cleanedImage: previewPayload.cleanedImage || null,
      cleanedImageError: previewPayload.cleanedImageError || "",
      validationResult: previewPayload.validationResult || null,
      validationError: previewPayload.validationError || ""
    }
  };
}

function buildUnsupportedContent(aiPayload) {
  if (!unsupportedContentReasons.has(aiPayload.unsupportedReason)) {
    return null;
  }

  return {
    title: "This photo is not supported yet.",
    message: "TidySnap supports children's clothes-only wardrobe photos, but not visible children/babies, baby items, private child identity items, or intimate kids clothing."
  };
}

function buildTopActionsFromSpatialPlan(spatialPlan) {
  const ids = ["keep-visible", "move-to-bins", "remove-or-store"];
  const points = [
    pointsByAction["keep-visible"],
    pointsByAction["move-to-bins"],
    pointsByAction["remove-or-store"]
  ];

  return spatialPlan.organization_plan.map((step, index) => ({
    id: ids[index],
    type: "ai_organization_step",
    title: step.action,
    reason: step.reason,
    items: [step.destination],
    placement: {
      move: [step.action],
      where: step.destination,
      how: step.reason,
      after: "This area should look clearer, easier to use, and less visually noisy."
    },
    points: points[index]
  }));
}

function buildLabelsFromSpatialPlan(spatialPlan) {
  return spatialPlan.organization_plan.map((step) => {
    const destination = step.destination.replace(/^Move (it|them) to\s+/i, "");
    return destination.length > 36 ? `${destination.slice(0, 33)}...` : destination;
  });
}

function buildBeforeAfterFromSpatialPlan(spatialPlan) {
  return {
    before: spatialPlan.detected_issues.join(" "),
    after: spatialPlan.organization_plan
      .map((step) => step.destination)
      .join(" ")
  };
}

function buildAIPhotoGuidance(spatialPlan) {
  if (!aiPlanRequestsBetterPhoto(spatialPlan)) {
    return {
      needsBetterPhoto: false,
      title: "",
      tips: []
    };
  }

  return {
    needsBetterPhoto: true,
    title: "AI needs a wider photo for a better organizer plan",
    tips: [
      "Step back and include the full cupboard, shelf, desk, or storage area.",
      "Show storage anchors such as drawers, shelves, bins, floor area, or wall hooks.",
      "Use good light so item categories and zones are visible."
    ]
  };
}

function aiPlanRequestsBetterPhoto(spatialPlan) {
  const text = [
    ...(spatialPlan?.detected_issues || []),
    ...(spatialPlan?.organization_plan || []).flatMap((step) => [
      step.action,
      step.destination,
      step.reason
    ])
  ].join(" ").toLowerCase();

  return text.includes("too close") ||
    text.includes("wider photo") ||
    text.includes("step back") ||
    text.includes("retake");
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      resolve(value.includes(",") ? value.split(",").pop() : value);
    };
    reader.onerror = () => reject(new Error("Could not read image bytes."));
    reader.readAsDataURL(file);
  });
}
