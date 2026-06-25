import { existsSync } from "node:fs";
import { analyzeImage } from "../src/services/imageAnalysis.js";

const requiredFiles = [
  "index.html",
  "Clutter_Cleanup_Pipeline_Prompts_Updated.md",
  "netlify.toml",
  "netlify/functions/analyze-image.mjs",
  "netlify/functions/generate-clean-preview.mjs",
  "src/app.js",
  "src/styles.css",
  "src/services/imageAnalysis.js",
  "src/services/recommendationEngine.js",
  "src/services/scoring.js",
  "src/services/gamification.js",
  "src/data/cleanupPromptLibrary.js",
  "src/server/analyzeImageRoute.js",
  "src/server/imageEditor.js",
  "src/server/imageValidator.js",
  "src/server/openaiOrganizer.js",
  "src/server/promptTemplates.js",
  "docs/04_STACK_AND_CODE.md",
  "docs/05_TESTING.md"
];

const missing = requiredFiles.filter((filePath) => !existsSync(filePath));
if (missing.length) {
  throw new Error(`Missing required files: ${missing.join(", ")}`);
}

const samples = [
  {
    fileName: "messy-wardrobe-summer.jpg",
    fileSize: 800_000,
    imageMeta: { width: 900, height: 1400, aspectRatio: 900 / 1400 },
    city: "New York",
    now: new Date("2026-06-24")
  },
  {
    fileName: "bookshelf-reading-list.jpg",
    fileSize: 650_000,
    imageMeta: { width: 1200, height: 1000, aspectRatio: 1.2 },
    city: "London",
    now: new Date("2026-06-24")
  },
  {
    fileName: "desk-clutter-cables.jpg",
    fileSize: 1_200_000,
    imageMeta: { width: 1600, height: 900, aspectRatio: 1600 / 900 },
    city: "Mumbai",
    now: new Date("2026-06-24")
  }
];

for (const sample of samples) {
  const result = analyzeImage(sample);
  assert(result.topActions.length === 3, `${sample.fileName} must return exactly 3 actions.`);
  assert(result.topActions.every((action) => action.placement?.where && action.placement?.how), "Each action must say where and how to move items.");
  assert(result.spatialPlan.detected_issues.length === 3, "Spatial plan must return exactly 3 detected issues.");
  assert(result.spatialPlan.organization_plan.length === 3, "Spatial plan must return exactly 3 organization steps.");
  assert(result.spatialPlan.organization_plan.every((step) => step.action && step.destination && step.reason), "Each spatial step must include action, destination, and reason.");
  assert(result.cleanlinessScore >= 1 && result.cleanlinessScore <= 10, "Score must be 1 to 10.");
  assert(result.organizerPlan?.zones?.length === 3, "Organizer plan must return 3 zones.");
  assert(result.cleanupPrompt?.category?.prompt_template, "Cleanup prompt category must be present.");
  assert(result.suggestedBinLabels.length > 0, "Storage bin labels must be present.");
  assert(result.beforeAfterPreview.before && result.beforeAfterPreview.after, "Before/after preview must exist.");
}

console.log("Build validation passed.");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
