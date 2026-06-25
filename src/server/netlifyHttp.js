export function parseJsonEventBody(body, maxBytes = 22 * 1024 * 1024) {
  if (!body) {
    const error = new Error("Request body is empty.");
    error.statusCode = 400;
    throw error;
  }

  if (Buffer.byteLength(body, "utf8") > maxBytes) {
    const error = new Error("Request body is too large.");
    error.statusCode = 413;
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

export function jsonResponse(statusCode, payload, headers = {}) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers
    },
    body: JSON.stringify(payload)
  };
}

export function responseHeadersForError(error) {
  if (error.retryAfterSeconds) {
    return {
      "retry-after": String(error.retryAfterSeconds)
    };
  }

  return {};
}
