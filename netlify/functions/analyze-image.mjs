import { analyzeImagePayload, statusCodeForError } from "../../src/server/analyzeImageRoute.js";
import { loadEnvFile } from "../../src/server/env.js";
import { jsonResponse, parseJsonEventBody, responseHeadersForError } from "../../src/server/netlifyHttp.js";
import { assertRateLimit, getClientIdentifierFromEvent } from "../../src/server/rateLimit.js";

loadEnvFile();

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, {
      ok: false,
      error: "Method not allowed."
    });
  }

  try {
    assertRateLimit({
      action: "analyze",
      clientId: getClientIdentifierFromEvent(event)
    });
    const payload = await analyzeImagePayload(parseJsonEventBody(event.body));
    return jsonResponse(200, payload);
  } catch (error) {
    return jsonResponse(error.statusCode || statusCodeForError(error), {
      ok: false,
      code: error.code || "ANALYZE_IMAGE_FAILED",
      error: error.message
    }, responseHeadersForError(error));
  }
}
