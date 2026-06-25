# Audit

Date: 2026-06-25

Scope:

- public Netlify deployment readiness
- OpenAI key exposure risk
- API abuse / spend risk
- upload handling
- prompt pipeline safety
- browser rendering safety
- X11 / server forwarding concern

## Executive Summary

TidySnap is close to MVP-public-ready, but it should be treated as a public paid-API surface.

The OpenAI key is kept server-side and is not shipped to the browser.

The biggest risk is cost abuse through public API endpoints. A best-effort in-memory rate limiter has been added, but this is not a full production-grade spend-control system on Netlify because serverless instances can restart or scale horizontally.

Before wider public launch, add at least one stronger control:

- OpenAI project spend limits
- Netlify / edge / Redis-backed rate limiting
- Turnstile / CAPTCHA before Preview Mode
- account login for Preview Mode

## What Was Checked

### API Key Handling

Status: pass

Findings:

- `OPENAI_API_KEY` is read only in server-side modules.
- Browser code does not contain the API key.
- `.env` and `.env.local` are ignored by Git.
- Netlify should store `OPENAI_API_KEY` in site environment variables.

Files checked:

- `src/server/openaiOrganizer.js`
- `src/server/imageEditor.js`
- `src/server/imageValidator.js`
- `.gitignore`
- `.env.example`
- frontend `src/` files

Do not put real keys in:

- `index.html`
- `src/`
- `.env.example`
- README or docs

### Public Endpoint Spend Risk

Status: improved, still needs production hardening

Public endpoints:

- `POST /api/analyze-image`
- `POST /api/generate-clean-preview`

Risk:

- Anyone on the internet can call these endpoints after deployment.
- Each Fast Mode request can call OpenAI vision/planner.
- Each Preview Mode request can call image generation and validation.
- An attacker can script requests and spend money.

Mitigation added:

- IP-based best-effort rate limiting.
- Analyze limit default: `3` requests per IP per window.
- Preview limit default: `1` request per IP per window.
- Window default: `10 minutes`.

Environment overrides:

```text
TIDYSNAP_ANALYZE_RATE_LIMIT_MAX=3
TIDYSNAP_PREVIEW_RATE_LIMIT_MAX=1
TIDYSNAP_RATE_LIMIT_WINDOW_MS=600000
```

Important limitation:

This limiter is in-memory. On Netlify Functions it resets on cold start and is not shared across all instances. It reduces accidental overuse and casual abuse, but it is not enough for high-traffic public launch.

Recommended next controls:

- Set OpenAI hard budget limits.
- Add CAPTCHA or Turnstile before Preview Mode.
- Use durable rate limiting such as Redis, Upstash, Netlify Blobs, or an edge gateway.
- Consider disabling Preview Mode until the planner output quality is proven.

### Request Size Handling

Status: pass

Mitigation added:

- Local Node API already capped JSON request body at 22 MB.
- Netlify function parser now also caps request body at 22 MB.

Risk still present:

- Large HEIC conversions can consume CPU/memory.
- Netlify function timeout/memory limits may fail on very large images.

Recommendation:

- Keep upload images under 10 MB for MVP QA.
- Later add client-side image resize/compression before upload.

### XSS / Browser Rendering

Status: improved

Findings:

- Result view uses `escapeHtml` for dynamic text.
- Status/error notice text in `src/app.js` was interpolated into `innerHTML`.

Mitigation added:

- `src/app.js` now escapes status messages before rendering.

Residual note:

- Image `dataUrl` values are rendered as image sources.
- They come from the backend and should remain MIME-limited to images.

### Prompt / Child Content Policy

Status: pass for MVP

Prompt source:

- `Clutter_Cleanup_Pipeline_Prompts_Updated.md`

Current supported:

- children's clothes-only storage
- children's wardrobes
- folded children's clothing
- school books and stationery without private identifying information

Current unsupported:

- visible children or babies
- baby items
- private children's identity items
- children's intimate clothing
- medical items

### Storage / Privacy

Status: pass for privacy-first MVP

Current behavior:

- No database.
- No permanent image storage.
- Browser holds a temporary preview URL.
- Backend holds image bytes only during the request.
- OpenAI receives image bytes when AI routes are used.

Public privacy note needed before launch:

- Tell users images are sent to OpenAI for analysis and optional preview generation.
- Tell users images are not saved by TidySnap in this MVP.

### Netlify Hosting

Status: pass

Files:

- `netlify.toml`
- `netlify/functions/analyze-image.mjs`
- `netlify/functions/generate-clean-preview.mjs`

Required Netlify environment variables:

```text
OPENAI_API_KEY
```

Optional:

```text
OPENAI_MODEL
OPENAI_IMAGE_MODEL
OPENAI_IMAGE_QUALITY
TIDYSNAP_GENERATE_CLEAN_IMAGE
TIDYSNAP_ANALYZE_RATE_LIMIT_MAX
TIDYSNAP_PREVIEW_RATE_LIMIT_MAX
TIDYSNAP_RATE_LIMIT_WINDOW_MS
TIDYSNAP_FEEDBACK_URL
TIDYSNAP_GA_MEASUREMENT_ID
```

### X11 Forwarding

Status: not applicable to current deployment

Netlify does not use SSH X11 forwarding.

There is no X11 surface in this browser app or Netlify Functions setup.

If this app is later moved to a Linux VM:

- keep SSH X11 forwarding disabled unless explicitly needed
- do not expose an X server publicly
- do not run browser automation with a privileged display session on a public server

## Changes Made During This Audit

- Added `src/server/rateLimit.js`.
- Added `src/server/netlifyHttp.js`.
- Added rate limiting to local API routes.
- Added rate limiting to Netlify Functions.
- Added request-size caps to Netlify Functions.
- Escaped upload/status notices in `src/app.js`.
- Added rate-limit and Netlify HTTP helper tests.
- Added this audit doc.

## Tests Run

Run before deploy:

```powershell
npm.cmd test
npm.cmd run build
```

## Launch Checklist

Before public Netlify launch:

- Add `OPENAI_API_KEY` in Netlify environment variables.
- Set OpenAI usage budget limits.
- Keep Preview Mode enabled only if cost is acceptable.
- Consider `TIDYSNAP_GENERATE_CLEAN_IMAGE=false` for the first public smoke test.
- Set rate limits:

```text
TIDYSNAP_ANALYZE_RATE_LIMIT_MAX=3
TIDYSNAP_PREVIEW_RATE_LIMIT_MAX=1
TIDYSNAP_RATE_LIMIT_WINDOW_MS=600000
```

- Add a short privacy note in the app before broader public sharing.
- Add `TIDYSNAP_FEEDBACK_URL` after the Tally form is ready.
- Add `TIDYSNAP_GA_MEASUREMENT_ID` only if Google Analytics tracking is acceptable for launch.
- Watch Netlify Function logs after launch.
- Watch OpenAI usage dashboard after launch.

## Residual Risks

High:

- Public serverless endpoints can still be abused across cold starts or parallel instances.
- OpenAI spend can grow if the app is shared widely without durable rate limiting or budget caps.

Medium:

- Large image uploads can hit function limits.
- Image generation can produce imperfect or invalid edits even after validation.

Low:

- No persistent storage means no room history yet.
- No user accounts means no per-user history, quotas, or saved progress.
