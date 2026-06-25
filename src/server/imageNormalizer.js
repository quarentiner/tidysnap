import heicConvert from "heic-convert";

const supportedVisionTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif"
]);

export async function normalizeImageForVision({ fileName = "", mimeType = "", base64 = "" }) {
  const normalizedMimeType = normalizeMimeType(mimeType, fileName);
  const inputBuffer = Buffer.from(base64, "base64");

  if (!inputBuffer.length) {
    const error = new Error("Uploaded image is empty.");
    error.code = "EMPTY_IMAGE";
    throw error;
  }

  if (isHeicType(normalizedMimeType, fileName)) {
    const jpegBuffer = Buffer.from(await heicConvert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: 0.82
    }));

    return {
      buffer: jpegBuffer,
      mimeType: "image/jpeg",
      converted: true,
      originalMimeType: normalizedMimeType
    };
  }

  if (!supportedVisionTypes.has(normalizedMimeType)) {
    const error = new Error("Unsupported image type. Use JPG, PNG, WebP, GIF, HEIC, or HEIF.");
    error.code = "UNSUPPORTED_IMAGE_TYPE";
    throw error;
  }

  return {
    buffer: inputBuffer,
    mimeType: normalizedMimeType === "image/jpg" ? "image/jpeg" : normalizedMimeType,
    converted: false,
    originalMimeType: normalizedMimeType
  };
}

export function normalizeMimeType(mimeType = "", fileName = "") {
  const lowerMimeType = mimeType.toLowerCase();
  if (lowerMimeType) {
    return lowerMimeType;
  }

  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (lowerName.endsWith(".png")) {
    return "image/png";
  }
  if (lowerName.endsWith(".webp")) {
    return "image/webp";
  }
  if (lowerName.endsWith(".gif")) {
    return "image/gif";
  }
  if (lowerName.endsWith(".heic")) {
    return "image/heic";
  }
  if (lowerName.endsWith(".heif")) {
    return "image/heif";
  }

  return "application/octet-stream";
}

function isHeicType(mimeType, fileName) {
  const lowerName = fileName.toLowerCase();
  return mimeType === "image/heic" ||
    mimeType === "image/heif" ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif");
}
