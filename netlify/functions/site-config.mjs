import { jsonResponse } from "../../src/server/netlifyHttp.js";
import { publicSiteConfigFromEnv } from "../../src/server/siteConfig.js";
import { loadEnvFile } from "../../src/server/env.js";

loadEnvFile();

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, {
      ok: false,
      error: "Method not allowed."
    });
  }

  return jsonResponse(200, {
    ok: true,
    config: publicSiteConfigFromEnv()
  });
}
