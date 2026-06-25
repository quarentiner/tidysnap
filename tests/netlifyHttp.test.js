import assert from "node:assert/strict";
import test from "node:test";
import { jsonResponse, parseJsonEventBody, responseHeadersForError } from "../src/server/netlifyHttp.js";

test("parses Netlify JSON body with a size limit", () => {
  assert.deepEqual(parseJsonEventBody('{"ok":true}', 100), { ok: true });
  assert.throws(() => parseJsonEventBody("", 100), /empty/);
  assert.throws(() => parseJsonEventBody("{bad", 100), /valid JSON/);

  let error;
  try {
    parseJsonEventBody('{"too":"large"}', 5);
  } catch (caughtError) {
    error = caughtError;
  }

  assert.equal(error.statusCode, 413);
});

test("builds JSON response and retry-after headers", () => {
  assert.deepEqual(jsonResponse(200, { ok: true }).headers, {
    "content-type": "application/json; charset=utf-8"
  });

  assert.deepEqual(responseHeadersForError({
    retryAfterSeconds: 17
  }), {
    "retry-after": "17"
  });
});
