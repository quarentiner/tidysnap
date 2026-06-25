import assert from "node:assert/strict";
import test from "node:test";
import { calculateCleanlinessScore } from "../src/services/scoring.js";

test("score always stays between 1 and 10", () => {
  const score = calculateCleanlinessScore({
    sceneType: "clutter",
    confidence: 0.1,
    imageMeta: { aspectRatio: 2.1 },
    fileSize: 10_000_000
  });

  assert.ok(score.score >= 1);
  assert.ok(score.score <= 10);
});

test("bookshelf score gets a quick-reset bonus", () => {
  const score = calculateCleanlinessScore({
    sceneType: "bookshelf",
    confidence: 0.8,
    imageMeta: { aspectRatio: 1.1 },
    fileSize: 200_000
  });

  assert.equal(score.score, 7);
});
