import { baseSceneScores, SCENE_TYPES } from "../data/rules.js";

export function calculateCleanlinessScore({ sceneType, confidence = 0.5, imageMeta = {}, fileSize = 0 }) {
  let score = baseSceneScores[sceneType] || baseSceneScores[SCENE_TYPES.CLUTTER];
  const notes = [];

  if (confidence < 0.45) {
    score -= 1;
    notes.push("Low scene confidence lowered the score.");
  }

  if (sceneType === SCENE_TYPES.BOOKSHELF) {
    score += 1;
    notes.push("Bookshelves usually improve quickly with grouping.");
  }

  if (sceneType === SCENE_TYPES.CLUTTER) {
    score -= 1;
    notes.push("Mixed clutter needs stronger sorting.");
  }

  if (imageMeta.aspectRatio > 1.6 && sceneType === SCENE_TYPES.CLUTTER) {
    score -= 1;
    notes.push("Wide surfaces often collect more loose items.");
  }

  if (fileSize > 4_000_000) {
    score -= 1;
    notes.push("Large detailed photo may contain more visible items.");
  }

  return {
    score: clamp(Math.round(score), 1, 10),
    notes
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
