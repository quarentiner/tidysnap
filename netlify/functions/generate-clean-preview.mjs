import { generateCleanPreviewPayload, statusCodeForError } from "../../src/server/analyzeImageRoute.js";
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
      action: "preview",
      clientId: getClientIdentifierFromEvent(event)
    });
    const payload = await generateCleanPreviewPayload(parseJsonEventBody(event.body));
    return jsonResponse(200, payload);
  } catch (error) {
    return jsonResponse(error.statusCode || statusCodeForError(error), {
      ok: false,
      code: error.code || "GENERATE_CLEAN_PREVIEW_FAILED",
      error: error.message
    }, responseHeadersForError(error));
  }
}
