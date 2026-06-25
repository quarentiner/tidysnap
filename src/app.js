import { renderResultView, bindResultView } from "./components/resultView.js";
import {
  applyAIOrganizationPlan,
  applyCleanedPreviewResult,
  requestAIOrganizationPlan,
  requestCleanedPreview
} from "./services/aiAnalysisClient.js";
import { readImageFile } from "./services/fileImage.js";
import { analyzeImage } from "./services/imageAnalysis.js";
import { getCompletionState } from "./services/gamification.js";

const unsupportedContentReasons = new Set([
  "unsupported_child_sensitive_content",
  "unsupported_baby_related_content"
]);

const uploadButton = document.querySelector("#uploadButton");
const photoInput = document.querySelector("#photoInput");
const photoStage = document.querySelector(".photo-stage");
const photoPreview = document.querySelector("#photoPreview");
const emptyPhoto = document.querySelector("#emptyPhoto");
const photoFallback = document.querySelector("#photoFallback");
const resultsRoot = document.querySelector("#resultsRoot");
const citySelect = document.querySelector("#citySelect");

const state = {
  result: null,
  photoUrl: "",
  previewWarning: "",
  previewMode: {
    isGenerating: false,
    error: ""
  },
  completedIds: new Set()
};

uploadButton.addEventListener("click", () => {
  photoInput.value = "";
  photoInput.click();
});

citySelect.addEventListener("change", async () => {
  if (!state.result || !photoInput.files?.[0]) {
    return;
  }

  await analyzeSelectedPhoto(photoInput.files[0], state.photoUrl);
});

photoInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  if (state.photoUrl) {
    URL.revokeObjectURL(state.photoUrl);
  }

  state.photoUrl = URL.createObjectURL(file);
  await analyzeSelectedPhoto(file, state.photoUrl);
});

async function analyzeSelectedPhoto(file, photoUrl) {
  uploadButton.disabled = true;
  uploadButton.textContent = "Analyzing photo...";

  try {
    const imageRead = await readImageFile(file, photoUrl);

    state.completedIds = new Set();
    state.previewMode = {
      isGenerating: false,
      error: ""
    };
    state.previewWarning = imageRead.warning;
    let result = analyzeImage({
      fileName: file.name,
      fileSize: file.size,
      imageMeta: imageRead.imageMeta,
      city: citySelect.value,
      now: new Date()
    });

    try {
      uploadButton.textContent = "Fast mode analysis...";
      const aiPayload = await requestAIOrganizationPlan(file, citySelect.value, result.sceneType);
      result = applyAIOrganizationPlan(result, aiPayload);
      state.previewWarning = buildAIStatusMessage(aiPayload);
    } catch (aiError) {
      state.previewWarning = buildAIFallbackMessage(imageRead.warning, aiError);
      console.warn(aiError);
    }

    state.result = result;

    if (imageRead.previewAvailable) {
      showPhotoPreview(photoUrl);
    } else if (result.aiAnalysis?.previewImage?.dataUrl) {
      showPhotoPreview(result.aiAnalysis.previewImage.dataUrl);
    } else {
      showPreviewFallback(Boolean(result.aiAnalysis));
    }

    render();
    requestAnimationFrame(() => {
      resultsRoot.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } catch (error) {
    resultsRoot.innerHTML = `
      <div class="notice-panel" role="alert">
        <strong>Photo could not be read.</strong>
        <span>Try another image file.</span>
      </div>
    `;
    console.error(error);
  } finally {
    uploadButton.disabled = false;
    uploadButton.textContent = "Upload or capture photo";
  }
}

function render() {
  if (!state.result) {
    resultsRoot.innerHTML = "";
    return;
  }

  const completion = getCompletionState(
    state.result.topActions,
    state.completedIds,
    state.result.sceneType
  );

  resultsRoot.innerHTML = `${renderPreviewNotice(state.previewWarning)}${renderResultView(state.result, completion, state.previewMode)}`;
  bindResultView(resultsRoot, {
    onToggleAction(actionId, checked) {
      if (checked) {
        state.completedIds.add(actionId);
      } else {
        state.completedIds.delete(actionId);
      }
      render();
    },
    onGenerateCleanPreview() {
      generateCleanedPreview();
    }
  });
}

async function generateCleanedPreview() {
  const [file] = photoInput.files || [];
  if (!file || !state.result?.plannerResult || state.previewMode.isGenerating) {
    return;
  }

  state.previewMode = {
    isGenerating: true,
    error: ""
  };
  render();

  try {
    const previewPayload = await requestCleanedPreview(file, state.result.plannerResult);
    state.result = applyCleanedPreviewResult(state.result, previewPayload);
  } catch (error) {
    state.previewMode = {
      isGenerating: false,
      error: error.message
    };
    render();
    console.warn(error);
    return;
  }

  state.previewMode = {
    isGenerating: false,
    error: ""
  };
  render();
}

function showPhotoPreview(photoUrl) {
  photoStage.classList.remove("is-compact-preview");
  photoPreview.src = photoUrl;
  photoPreview.hidden = false;
  emptyPhoto.hidden = true;
  photoFallback.hidden = true;
}

function showPreviewFallback(aiAnalyzed = false) {
  photoStage.classList.add("is-compact-preview");
  photoPreview.removeAttribute("src");
  photoPreview.hidden = true;
  emptyPhoto.hidden = true;
  photoFallback.hidden = false;
  const fallbackText = photoFallback.querySelector("p");
  if (fallbackText) {
    fallbackText.textContent = aiAnalyzed
      ? "HEIC uploaded. AI analyzed the converted image, but preview is unavailable."
      : "Photo uploaded. Preview is not available in this browser.";
  }
}

function renderPreviewNotice(message) {
  if (!message) {
    return "";
  }

  return `
    <div class="notice-panel compact-notice" role="status">
      <strong>Photo accepted.</strong>
      <span>${message}</span>
    </div>
  `;
}

function buildAIStatusMessage(aiPayload) {
  if (unsupportedContentReasons.has(aiPayload.unsupportedReason)) {
    return "This MVP supports children's clothes-only wardrobe photos, but blocks visible children/babies and private child-sensitive items.";
  }

  return aiPayload.converted
    ? "Fast mode complete. HEIC converted to JPEG and AI organizer analyzed the photo."
    : "Fast mode complete. AI organizer analyzed your photo.";
}

function buildAIFallbackMessage(existingMessage, error) {
  const messages = [];
  if (existingMessage) {
    messages.push(existingMessage);
  }

  if (error.code === "OPENAI_API_KEY_MISSING") {
    messages.push("AI organizer is not active because OPENAI_API_KEY was not found on the server.");
  } else if (error.code === "UNSUPPORTED_IMAGE_TYPE") {
    messages.push("AI organizer could not read this file type. Try JPG, PNG, WebP, or HEIC.");
  } else {
    messages.push(`AI organizer could not finish, so TidySnap used the local rule-based plan. ${error.message}`);
  }

  return messages.join(" ");
}
