import { sendJson } from "./httpUtils.js";

export function publicSiteConfigFromEnv(env = process.env) {
  return {
    feedbackUrl: safeHttpsUrl(env.TIDYSNAP_FEEDBACK_URL),
    gaMeasurementId: safeGaMeasurementId(env.TIDYSNAP_GA_MEASUREMENT_ID)
  };
}

export function handleSiteConfigRequest(request, response) {
  if (request.method !== "GET") {
    sendJson(response, 405, {
      ok: false,
      error: "Method not allowed."
    });
    return;
  }

  sendJson(response, 200, {
    ok: true,
    config: publicSiteConfigFromEnv()
  });
}

function safeHttpsUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function safeGaMeasurementId(value) {
  const id = String(value || "").trim().toUpperCase();
  return /^G-[A-Z0-9]+$/.test(id) ? id : "";
}
