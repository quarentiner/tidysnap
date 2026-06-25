export function loadImageMetaFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
        aspectRatio: image.naturalWidth / Math.max(image.naturalHeight, 1)
      });
    };
    image.onerror = () => reject(new Error("Image failed to load."));
    image.src = url;
  });
}

export async function readImageFile(file, url) {
  try {
    const imageMeta = await loadImageMetaFromUrl(url);
    return {
      imageMeta,
      previewAvailable: true,
      warning: ""
    };
  } catch {
    return {
      imageMeta: createFallbackImageMeta(file),
      previewAvailable: false,
      warning: createPreviewWarning(file)
    };
  }
}

function createFallbackImageMeta(file) {
  return {
    width: 0,
    height: 0,
    aspectRatio: 0,
    unsupportedPreview: true,
    fileType: file.type || "unknown"
  };
}

function createPreviewWarning(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".heic") || name.endsWith(".heif") || file.type === "image/heic" || file.type === "image/heif") {
    return "iPhone HEIC photos can be analyzed by this MVP, but this browser cannot preview them yet.";
  }

  return "This image format could not be previewed in the browser, so TidySnap used fallback analysis.";
}
