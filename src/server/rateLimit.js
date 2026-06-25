const rateLimitStore = new Map();

export function assertRateLimit({
  action,
  clientId,
  now = Date.now(),
  profile = rateLimitProfileForAction(action)
}) {
  if (!profile.maxRequests || profile.maxRequests <= 0) {
    return;
  }

  const key = `${action}:${clientId || "unknown"}`;
  const current = rateLimitStore.get(key);

  if (!current || now >= current.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + profile.windowMs
    });
    cleanupExpiredEntries(now);
    return;
  }

  if (current.count >= profile.maxRequests) {
    const error = new Error("Too many requests. Please wait before trying again.");
    error.code = "RATE_LIMITED";
    error.statusCode = 429;
    error.retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    throw error;
  }

  current.count += 1;
}

export function getClientIdentifierFromRequest(request) {
  return firstForwardedIp(
    request.headers["x-nf-client-connection-ip"] ||
    request.headers["x-forwarded-for"] ||
    request.headers["client-ip"] ||
    request.socket?.remoteAddress ||
    "unknown"
  );
}

export function getClientIdentifierFromEvent(event) {
  return firstForwardedIp(
    getHeader(event.headers, "x-nf-client-connection-ip") ||
    getHeader(event.headers, "x-forwarded-for") ||
    getHeader(event.headers, "client-ip") ||
    event.requestContext?.identity?.sourceIp ||
    "unknown"
  );
}

export function clearRateLimitStore() {
  rateLimitStore.clear();
}

function rateLimitProfileForAction(action) {
  const windowMs = positiveNumberFromEnv("TIDYSNAP_RATE_LIMIT_WINDOW_MS", 10 * 60 * 1000);

  if (action === "preview") {
    return {
      maxRequests: positiveNumberFromEnv("TIDYSNAP_PREVIEW_RATE_LIMIT_MAX", 1),
      windowMs
    };
  }

  return {
    maxRequests: positiveNumberFromEnv("TIDYSNAP_ANALYZE_RATE_LIMIT_MAX", 3),
    windowMs
  };
}

function positiveNumberFromEnv(key, fallback) {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function firstForwardedIp(value) {
  return String(value || "unknown").split(",")[0].trim() || "unknown";
}

function getHeader(headers = {}, name) {
  const direct = headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()];
  if (direct) {
    return direct;
  }

  const match = Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return match?.[1] || "";
}

function cleanupExpiredEntries(now) {
  if (rateLimitStore.size < 1000) {
    return;
  }

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}
