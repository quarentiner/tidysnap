import assert from "node:assert/strict";
import test from "node:test";
import { renderResultView } from "../src/components/resultView.js";
import { analyzeImage } from "../src/services/imageAnalysis.js";
import { getCompletionState } from "../src/services/gamification.js";

test("result view shows move path, organizer map, and cleaned look", () => {
  const result = analyzeImage({
    fileName: "messy-wardrobe.jpg",
    fileSize: 500_000,
    imageMeta: { width: 900, height: 1500, aspectRatio: 0.6 },
    city: "Mumbai",
    now: new Date("2026-06-24")
  });
  const completion = getCompletionState(result.topActions, new Set(), result.sceneType);
  const html = renderResultView(result, completion);

  assert.match(html, /Move/);
  assert.match(html, /Where/);
  assert.match(html, /How/);
  assert.match(html, /After/);
  assert.match(html, /Where things should go/);
  assert.match(html, /Cleaned look/);
  assert.match(html, /Professional organizer plan/);
  assert.match(html, /Destination:/);
  assert.match(html, /Reason:/);
  assert.match(html, /Image cleanup direction/);
  assert.match(html, /Reusable cleanup prompt/);
});

test("AI result view does not show closet season copy for clutter scenes", () => {
  const result = {
    ...analyzeImage({
      fileName: "desk-clutter.jpg",
      fileSize: 500_000,
      imageMeta: { width: 1200, height: 800, aspectRatio: 1.5 },
      city: "Mumbai",
      now: new Date("2026-06-24")
    }),
    aiAnalysis: {
      source: "openai",
      converted: true,
      originalMimeType: "image/heic",
      mimeType: "image/jpeg"
    }
  };
  const completion = getCompletionState(result.topActions, new Set(), result.sceneType);
  const html = renderResultView(result, completion);

  assert.doesNotMatch(html, /keep light daily clothes/i);
  assert.match(html, /AI detected visible clutter/);
});

test("AI result view shows generated cleaned image when available", () => {
  const result = {
    ...analyzeImage({
      fileName: "desk-clutter.jpg",
      fileSize: 500_000,
      imageMeta: { width: 1200, height: 800, aspectRatio: 1.5 },
      city: "Mumbai",
      now: new Date("2026-06-24")
    }),
    aiAnalysis: {
      source: "openai",
      converted: true,
      originalMimeType: "image/heic",
      mimeType: "image/jpeg",
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
    }
  };
  const completion = getCompletionState(result.topActions, new Set(), result.sceneType);
  const html = renderResultView(result, completion);

  assert.match(html, /Generated after image/);
  assert.match(html, /Cleaned version preview/);
  assert.match(html, /After image passed validation/);
  assert.match(html, /data:image\/jpeg;base64,cleaned123/);
});

test("AI result view shows preview mode button before cleaned image exists", () => {
  const result = {
    ...analyzeImage({
      fileName: "desk-clutter.jpg",
      fileSize: 500_000,
      imageMeta: { width: 1200, height: 800, aspectRatio: 1.5 },
      city: "Mumbai",
      now: new Date("2026-06-24")
    }),
    aiAnalysis: {
      source: "openai",
      mode: "fast",
      converted: false,
      originalMimeType: "image/jpeg",
      mimeType: "image/jpeg"
    }
  };
  const completion = getCompletionState(result.topActions, new Set(), result.sceneType);
  const html = renderResultView(result, completion);

  assert.match(html, /Preview mode/);
  assert.match(html, /Generate cleaned preview/);
  assert.match(html, /data-generate-clean-preview/);
});

test("preview mode button shows loading and errors", () => {
  const result = {
    ...analyzeImage({
      fileName: "desk-clutter.jpg",
      fileSize: 500_000,
      imageMeta: { width: 1200, height: 800, aspectRatio: 1.5 },
      city: "Mumbai",
      now: new Date("2026-06-24")
    }),
    aiAnalysis: {
      source: "openai",
      mode: "fast",
      converted: false,
      originalMimeType: "image/jpeg",
      mimeType: "image/jpeg"
    }
  };
  const completion = getCompletionState(result.topActions, new Set(), result.sceneType);
  const html = renderResultView(result, completion, {
    isGenerating: true,
    error: "Preview failed."
  });

  assert.match(html, /Generating preview/);
  assert.match(html, /Preview failed/);
  assert.match(html, /disabled/);
});

test("result view shows unsupported child-sensitive content note", () => {
  const result = {
    ...analyzeImage({
      fileName: "desk-clutter.jpg",
      fileSize: 500_000,
      imageMeta: { width: 1200, height: 800, aspectRatio: 1.5 },
      city: "Mumbai",
      now: new Date("2026-06-24")
    }),
    unsupportedContent: {
      title: "This photo is not supported yet.",
      message: "TidySnap supports children's clothes-only wardrobe photos, but not visible children/babies, baby items, private child identity items, or intimate kids clothing."
    },
    aiAnalysis: {
      source: "openai",
      converted: false,
      originalMimeType: "image/jpeg",
      mimeType: "image/jpeg",
      unsupportedReason: "unsupported_child_sensitive_content"
    }
  };
  const completion = getCompletionState(result.topActions, new Set(), result.sceneType);
  const html = renderResultView(result, completion);

  assert.match(html, /This photo is not supported yet/);
  assert.match(html, /clothes-only wardrobe photos/);
  assert.match(html, /Unsupported child-sensitive content/);
});
