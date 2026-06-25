import { SCENE_TYPES } from "../data/rules.js";

export function createGamificationPlan(actions, sceneType) {
  return {
    totalAvailablePoints: actions.reduce((total, action) => total + action.points, 0),
    availableBadges: availableBadges(sceneType)
  };
}

export function getCompletionState(actions, completedIds, sceneType) {
  const completedActionIds = new Set(completedIds);
  const totalAvailablePoints = actions.reduce((total, action) => total + action.points, 0);
  const pointsEarned = actions
    .filter((action) => completedActionIds.has(action.id))
    .reduce((total, action) => total + action.points, 0);
  const progressPercent = totalAvailablePoints === 0
    ? 0
    : Math.round((pointsEarned / totalAvailablePoints) * 100);
  const completed = actions.length > 0 && actions.every((action) => completedActionIds.has(action.id));

  return {
    completedActionIds,
    totalAvailablePoints,
    pointsEarned,
    progressPercent,
    completed,
    badges: earnedBadges({ completedActionIds, completed, sceneType })
  };
}

function earnedBadges({ completedActionIds, completed, sceneType }) {
  const badges = [];

  if (completedActionIds.size >= 1) {
    badges.push("First Sort");
  }

  if (completedActionIds.has("move-to-bins")) {
    badges.push("Bin Master");
  }

  if (sceneType === SCENE_TYPES.BOOKSHELF && completed) {
    badges.push("Shelf Reset");
  }

  if (sceneType === SCENE_TYPES.WARDROBE && completed) {
    badges.push("Closet Win");
  }

  return badges;
}

function availableBadges(sceneType) {
  const badges = ["First Sort", "Bin Master"];

  if (sceneType === SCENE_TYPES.BOOKSHELF) {
    badges.push("Shelf Reset");
  }

  if (sceneType === SCENE_TYPES.WARDROBE) {
    badges.push("Closet Win");
  }

  return badges;
}
