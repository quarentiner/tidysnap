import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import {
  handleAnalyzeImageRequest,
  handleGenerateCleanPreviewRequest
} from "../src/server/analyzeImageRoute.js";
import { loadEnvFile } from "../src/server/env.js";
import { handleSiteConfigRequest } from "../src/server/siteConfig.js";

const root = resolve(".");
const port = Number(process.env.PORT || 5173);
loadEnvFile(root);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://localhost:${port}`);
    if (url.pathname === "/api/analyze-image") {
      await handleAnalyzeImageRequest(request, response);
      return;
    }

    if (url.pathname === "/api/generate-clean-preview") {
      await handleGenerateCleanPreviewRequest(request, response);
      return;
    }

    if (url.pathname === "/api/site-config") {
      handleSiteConfigRequest(request, response);
      return;
    }

    const requestedPath = decodeURIComponent(url.pathname);
    const relativePath = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
    const filePath = resolve(join(root, relativePath));

    if (!filePath.startsWith(root) || !existsSync(filePath)) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "content-type": mimeTypes[extname(filePath)] || "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error.message);
  }
});

server.listen(port, () => {
  console.log(`TidySnap local server running at http://localhost:${port}`);
});
