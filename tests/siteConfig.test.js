import assert from "node:assert/strict";
import test from "node:test";
import { publicSiteConfigFromEnv } from "../src/server/siteConfig.js";

test("public site config exposes only safe public values", () => {
  assert.deepEqual(publicSiteConfigFromEnv({
    TIDYSNAP_FEEDBACK_URL: "https://tally.so/r/example",
    TIDYSNAP_GA_MEASUREMENT_ID: "g-abc123"
  }), {
    feedbackUrl: "https://tally.so/r/example",
    gaMeasurementId: "G-ABC123"
  });
});

test("public site config drops unsafe urls and invalid analytics ids", () => {
  assert.deepEqual(publicSiteConfigFromEnv({
    TIDYSNAP_FEEDBACK_URL: "javascript:alert(1)",
    TIDYSNAP_GA_MEASUREMENT_ID: "not-a-ga-id"
  }), {
    feedbackUrl: "",
    gaMeasurementId: ""
  });
});
