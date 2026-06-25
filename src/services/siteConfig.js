export async function loadSiteConfig() {
  try {
    const response = await fetch("/api/site-config");
    if (!response.ok) {
      return emptyConfig();
    }

    const payload = await response.json();
    return normalizeConfig(payload.config);
  } catch {
    return emptyConfig();
  }
}

function normalizeConfig(config = {}) {
  return {
    feedbackUrl: typeof config.feedbackUrl === "string" ? config.feedbackUrl : "",
    gaMeasurementId: typeof config.gaMeasurementId === "string" ? config.gaMeasurementId : ""
  };
}

function emptyConfig() {
  return {
    feedbackUrl: "",
    gaMeasurementId: ""
  };
}
