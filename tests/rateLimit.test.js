import assert from "node:assert/strict";
import test from "node:test";
import {
  assertRateLimit,
  clearRateLimitStore,
  getClientIdentifierFromEvent
} from "../src/server/rateLimit.js";

test("rate limiter blocks requests over the configured window", () => {
  clearRateLimitStore();
  const profile = {
    maxRequests: 2,
    windowMs: 1000
  };

  assert.doesNotThrow(() => assertRateLimit({
    action: "analyze",
    clientId: "1.2.3.4",
    now: 0,
    profile
  }));
  assert.doesNotThrow(() => assertRateLimit({
    action: "analyze",
    clientId: "1.2.3.4",
    now: 100,
    profile
  }));

  assert.throws(() => assertRateLimit({
    action: "analyze",
    clientId: "1.2.3.4",
    now: 200,
    profile
  }), /Too many requests/);

  assert.doesNotThrow(() => assertRateLimit({
    action: "analyze",
    clientId: "1.2.3.4",
    now: 1200,
    profile
  }));
});

test("default analyze rate limit allows 3 requests per window", () => {
  const previousLimit = process.env.TIDYSNAP_ANALYZE_RATE_LIMIT_MAX;
  delete process.env.TIDYSNAP_ANALYZE_RATE_LIMIT_MAX;
  clearRateLimitStore();

  try {
    assert.doesNotThrow(() => assertRateLimit({
      action: "analyze",
      clientId: "default-limit",
      now: 0
    }));
    assert.doesNotThrow(() => assertRateLimit({
      action: "analyze",
      clientId: "default-limit",
      now: 100
    }));
    assert.doesNotThrow(() => assertRateLimit({
      action: "analyze",
      clientId: "default-limit",
      now: 200
    }));

    assert.throws(() => assertRateLimit({
      action: "analyze",
      clientId: "default-limit",
      now: 300
    }), /Too many requests/);
  } finally {
    if (previousLimit === undefined) {
      delete process.env.TIDYSNAP_ANALYZE_RATE_LIMIT_MAX;
    } else {
      process.env.TIDYSNAP_ANALYZE_RATE_LIMIT_MAX = previousLimit;
    }
    clearRateLimitStore();
  }
});

test("default preview rate limit allows 1 request per window", () => {
  const previousLimit = process.env.TIDYSNAP_PREVIEW_RATE_LIMIT_MAX;
  delete process.env.TIDYSNAP_PREVIEW_RATE_LIMIT_MAX;
  clearRateLimitStore();

  try {
    assert.doesNotThrow(() => assertRateLimit({
      action: "preview",
      clientId: "default-preview-limit",
      now: 0
    }));

    assert.throws(() => assertRateLimit({
      action: "preview",
      clientId: "default-preview-limit",
      now: 100
    }), /Too many requests/);
  } finally {
    if (previousLimit === undefined) {
      delete process.env.TIDYSNAP_PREVIEW_RATE_LIMIT_MAX;
    } else {
      process.env.TIDYSNAP_PREVIEW_RATE_LIMIT_MAX = previousLimit;
    }
    clearRateLimitStore();
  }
});

test("rate limiter extracts the first forwarded client IP", () => {
  assert.equal(getClientIdentifierFromEvent({
    headers: {
      "x-forwarded-for": "9.8.7.6, 1.1.1.1"
    }
  }), "9.8.7.6");

  assert.equal(getClientIdentifierFromEvent({
    headers: {
      "X-Nf-Client-Connection-Ip": "5.5.5.5"
    }
  }), "5.5.5.5");
});
