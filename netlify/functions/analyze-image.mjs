import { analyzeImagePayload, statusCodeForError } from "../../src/server/analyzeImageRoute.js";
import { loadEnvFile } from "../../src/server/env.js";

loadEnvFile();

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, {
      ok: false,
      error: "Method not allowed."
    });
  }

  try {
    const payload = await analyzeImagePayload(parseJsonBody(event.body));
    return jsonResponse(200, payload);
  } catch (error) {
    return jsonResponse(error.statusCode || statusCodeForError(error), {
      ok: false,
      code: error.code || "ANALYZE_IMAGE_FAILED",
      error: error.message
    });
  }
}

function parseJsonBody(body) {
  if (!body) {
    const error = new Error("Request body is empty.");
    error.statusCode = 400;
    throw error;
  }

  try {
    return JSON.parse(body);
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(payload)
  };
}
