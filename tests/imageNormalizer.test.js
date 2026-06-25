import assert from "node:assert/strict";
import test from "node:test";
import { normalizeImageForVision, normalizeMimeType } from "../src/server/imageNormalizer.js";

test("normalizes image mime type from file extension", () => {
  assert.equal(normalizeMimeType("", "photo.JPG"), "image/jpeg");
  assert.equal(normalizeMimeType("", "photo.HEIC"), "image/heic");
  assert.equal(normalizeMimeType("", "photo.webp"), "image/webp");
});

test("accepts supported image types without conversion", async () => {
  const result = await normalizeImageForVision({
    fileName: "desk.png",
    mimeType: "image/png",
    base64: Buffer.from("png bytes").toString("base64")
  });

  assert.equal(result.mimeType, "image/png");
  assert.equal(result.converted, false);
});
