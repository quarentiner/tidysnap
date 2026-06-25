import assert from "node:assert/strict";
import test from "node:test";
import { applyAIOrganizationPlan, applyCleanedPreviewResult } from "../src/services/aiAnalysisClient.js";

const baseResult = {
  photoGuidance: {
    needsBetterPhoto: true,
    title: "Need a wider photo for a smarter organizer plan",
    tips: ["Local fallback tip"]
  },
  spatialPlan: {
    detected_issues: [],
    organization_plan: [],
    estimated_time_minutes: 15
  }
};

test("AI organizer success suppresses local unsupported-preview photo guidance", () => {
  const result = applyAIOrganizationPlan(baseResult, {
    source: "openai",
    mode: "fast",
    converted: true,
    originalMimeType: "image/heic",
    mimeType: "image/jpeg",
    previewImage: {
      mimeType: "image/jpeg",
      dataUrl: "data:image/jpeg;base64,abc123"
    },
    cleanedImage: {
      mimeType: "image/jpeg",
      dataUrl: "data:image/jpeg;base64,cleaned123",
      model: "gpt-image-2"
    },
    validationResult: {
      status: "pass",
      issues: [],
      recommended_fix: null
    },
    plannerResult: {
      status: "ok",
      reason: null,
      scene_category: "desk / workstation",
      inventory: [],
      organization_plan: [
        {
          object_id: "papers-1",
          action: "stack",
          target_location: "document tray",
          constraints: "Keep papers visible."
        }
      ],
      must_preserve: [],
      forbidden_changes: []
    },
    spatialPlan: {
      detected_issues: [
        "Desk surface has loose papers.",
        "Cables are mixed with daily tools.",
        "Small items need a tray."
      ],
      organization_plan: [
        {
          step_number: 1,
          action: "Clear loose papers from the desk.",
          destination: "Move them to a document tray.",
          reason: "Papers need one visible home."
        },
        {
          step_number: 2,
          action: "Clear cables from the work surface.",
          destination: "Move them to a drawer tray.",
          reason: "Cables should stay near the desk but off the surface."
        },
        {
          step_number: 3,
          action: "Clear small items beside the laptop.",
          destination: "Move them to a small-item tray.",
          reason: "Small items are easier to find when grouped."
        }
      ],
      estimated_time_minutes: 15
    }
  });

  assert.equal(result.photoGuidance.needsBetterPhoto, false);
  assert.equal(result.aiAnalysis.mode, "fast");
  assert.equal(result.aiAnalysis.converted, true);
  assert.equal(result.aiAnalysis.previewImage.dataUrl, "data:image/jpeg;base64,abc123");
  assert.equal(result.aiAnalysis.cleanedImage.dataUrl, "data:image/jpeg;base64,cleaned123");
  assert.equal(result.aiAnalysis.validationResult.status, "pass");
  assert.equal(result.plannerResult.status, "ok");
  assert.equal(result.cleanupPrompt.category.id, "desk_workstation");
  assert.equal(result.topActions.length, 3);
  assert.match(result.topActions[0].title, /Clear loose papers/);
  assert.match(result.topActions[1].placement.where, /drawer tray/);
  assert.match(result.suggestedBinLabels.join(" "), /document tray/);
  assert.match(result.beforeAfterPreview.before, /Cables are mixed/);
});

test("preview mode result adds cleaned image and validation without replacing planner data", () => {
  const fastResult = applyAIOrganizationPlan(baseResult, {
    source: "openai",
    mode: "fast",
    converted: false,
    originalMimeType: "image/jpeg",
    mimeType: "image/jpeg",
    plannerResult: {
      status: "ok",
      reason: null,
      scene_category: "desk / workstation",
      inventory: [],
      organization_plan: [
        {
          object_id: "papers-1",
          action: "stack",
          target_location: "document tray",
          constraints: "Keep papers visible."
        }
      ],
      must_preserve: [],
      forbidden_changes: []
    },
    spatialPlan: {
      detected_issues: [
        "Desk surface has loose papers.",
        "Cables are mixed with daily tools.",
        "Small items need a tray."
      ],
      organization_plan: [
        {
          step_number: 1,
          action: "Clear loose papers from the desk.",
          destination: "Move them to a document tray.",
          reason: "Papers need one visible home."
        },
        {
          step_number: 2,
          action: "Clear cables from the work surface.",
          destination: "Move them to a drawer tray.",
          reason: "Cables should stay near the desk but off the surface."
        },
        {
          step_number: 3,
          action: "Clear small items beside the laptop.",
          destination: "Move them to a small-item tray.",
          reason: "Small items are easier to find when grouped."
        }
      ],
      estimated_time_minutes: 15
    }
  });
  const result = applyCleanedPreviewResult(fastResult, {
    mode: "preview",
    cleanedImage: {
      mimeType: "image/jpeg",
      dataUrl: "data:image/jpeg;base64,cleaned123",
      model: "gpt-image-2"
    },
    validationResult: {
      status: "pass",
      issues: [],
      recommended_fix: null
    }
  });

  assert.equal(result.aiAnalysis.mode, "preview");
  assert.equal(result.aiAnalysis.cleanedImage.dataUrl, "data:image/jpeg;base64,cleaned123");
  assert.equal(result.aiAnalysis.validationResult.status, "pass");
  assert.equal(result.plannerResult.status, "ok");
  assert.equal(result.topActions.length, 3);
});

test("AI organizer unsupported child-sensitive content is surfaced in the result", () => {
  const result = applyAIOrganizationPlan(baseResult, {
    source: "openai",
    converted: false,
    originalMimeType: "image/jpeg",
    mimeType: "image/jpeg",
    unsupportedReason: "unsupported_child_sensitive_content",
    plannerResult: {
      status: "error",
      reason: "unsupported_child_sensitive_content"
    },
    spatialPlan: {
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
    }
  });

  assert.equal(result.unsupportedContent.title, "This photo is not supported yet.");
  assert.match(result.unsupportedContent.message, /clothes-only wardrobe photos/);
  assert.equal(result.aiAnalysis.unsupportedReason, "unsupported_child_sensitive_content");
  assert.equal(result.topActions.length, 3);
});

test("AI organizer can still ask for a wider photo", () => {
  const result = applyAIOrganizationPlan(baseResult, {
    source: "openai",
    converted: true,
    originalMimeType: "image/heic",
    mimeType: "image/jpeg",
    spatialPlan: {
      detected_issues: [
        "The photo is too close to identify storage anchors.",
        "Only loose items are visible.",
        "A wider photo is needed."
      ],
      organization_plan: [
        {
          step_number: 1,
          action: "Retake a wider photo of the full area.",
          destination: "Step back and include shelves or drawers.",
          reason: "Storage zones are needed for a useful plan."
        },
        {
          step_number: 2,
          action: "Create a temporary sorting zone.",
          destination: "Use the nearest clear surface.",
          reason: "This creates a safe place to sort."
        },
        {
          step_number: 3,
          action: "Group loose items by category.",
          destination: "Use labeled piles.",
          reason: "Groups are easier to place after a wider photo."
        }
      ],
      estimated_time_minutes: 10
    }
  });

  assert.equal(result.photoGuidance.needsBetterPhoto, true);
  assert.match(result.photoGuidance.title, /AI needs a wider photo/);
});
