import { sceneKeywords, sceneLabels, SCENE_TYPES } from "../data/rules.js";
import { getCleanupPromptForAnalysis } from "../data/cleanupPromptLibrary.js";
import { createGamificationPlan } from "./gamification.js";
import {
  buildRecommendations,
  getBeforeAfterPreview,
  getOptionalAccessories,
  getOrganizerPlan,
  getPhotoGuidance,
  getSpatialOrganizationPlan,
  getSuggestedBinLabels,
  getVisibleItems
} from "./recommendationEngine.js";
import { calculateCleanlinessScore } from "./scoring.js";
import { getSeasonForCity } from "./season.js";

export function analyzeImage({
  fileName = "",
  fileSize = 0,
  imageMeta = {},
  city = "New York",
  now = new Date(),
  visionProvider = null
} = {}) {
  const visionResult = visionProvider?.({ fileName, imageMeta }) || null;
  const classification = visionResult || classifyScene({ fileName, imageMeta });
  const season = getSeasonForCity(city, now);
  const topActions = buildRecommendations({
    sceneType: classification.sceneType,
    season
  });
  const scoring = calculateCleanlinessScore({
    sceneType: classification.sceneType,
    confidence: classification.confidence,
    imageMeta,
    fileSize
  });
  const spatialPlan = getSpatialOrganizationPlan({ sceneType: classification.sceneType, season });

  return {
    id: createAnalysisId(fileName),
    image: {
      fileName,
      width: imageMeta.width || 0,
      height: imageMeta.height || 0
    },
    sceneType: classification.sceneType,
    sceneLabel: sceneLabels[classification.sceneType],
    confidence: classification.confidence,
    evidence: classification.evidence,
    visibleItems: getVisibleItems({ sceneType: classification.sceneType, season }),
    cleanlinessScore: scoring.score,
    scoreNotes: scoring.notes,
    topActions,
    organizerPlan: getOrganizerPlan({ sceneType: classification.sceneType, season }),
    spatialPlan,
    cleanupPrompt: getCleanupPromptForAnalysis({
      sceneType: classification.sceneType,
      fileName,
      spatialPlan
    }),
    photoGuidance: getPhotoGuidance({ confidence: classification.confidence, imageMeta }),
    suggestedBinLabels: getSuggestedBinLabels({ sceneType: classification.sceneType, season }),
    optionalAccessories: getOptionalAccessories({ sceneType: classification.sceneType, season }),
    beforeAfterPreview: getBeforeAfterPreview({ sceneType: classification.sceneType }),
    gamification: createGamificationPlan(topActions, classification.sceneType),
    season
  };
}

export function classifyScene({ fileName = "", imageMeta = {} } = {}) {
  const normalizedName = fileName.toLowerCase();
  const scores = {
    [SCENE_TYPES.WARDROBE]: 0,
    [SCENE_TYPES.BOOKSHELF]: 0,
    [SCENE_TYPES.CLUTTER]: 0
  };
  const evidence = [];

  for (const [sceneType, keywords] of Object.entries(sceneKeywords)) {
    keywords.forEach((keyword) => {
      if (normalizedName.includes(keyword)) {
        scores[sceneType] += 5;
        evidence.push(`File name mentions "${keyword}".`);
      }
    });
  }

  if (imageMeta.height > imageMeta.width * 1.2) {
    scores[SCENE_TYPES.WARDROBE] += 2;
    evidence.push("Tall photo shape often matches cupboards or closets.");
  }

  if (imageMeta.width > imageMeta.height * 1.35) {
    scores[SCENE_TYPES.CLUTTER] += 2;
    evidence.push("Wide photo shape often matches desks or storage surfaces.");
  }

  if (imageMeta.width && imageMeta.height && Math.abs(imageMeta.width - imageMeta.height) < imageMeta.width * 0.25) {
    scores[SCENE_TYPES.BOOKSHELF] += 1;
    evidence.push("Balanced photo shape can match a shelf.");
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [bestScene, bestScore] = sorted[0];
  const secondScore = sorted[1][1];

  if (bestScore === 0) {
    return {
      sceneType: SCENE_TYPES.CLUTTER,
      confidence: 0.35,
      evidence: ["No strong visual metadata matched, so general clutter was used."]
    };
  }

  const confidence = Math.min(0.95, 0.45 + Math.max(bestScore - secondScore, 1) * 0.1);

  return {
    sceneType: bestScene,
    confidence: Number(confidence.toFixed(2)),
    evidence
  };
}

function createAnalysisId(fileName) {
  const safeName = fileName.replace(/[^a-z0-9]/gi, "").slice(0, 12) || "photo";
  return `${safeName}-${Date.now().toString(36)}`;
}
