import { escapeHtml } from "../utils/dom.js";

const unsupportedContentReasons = new Set([
  "unsupported_child_sensitive_content",
  "unsupported_baby_related_content"
]);

export function renderResultView(result, completion, previewMode = {}) {
  const actions = result.topActions.map((action) => renderActionCard(action, completion)).join("");
  const bins = result.suggestedBinLabels.map((label) => `<span>${escapeHtml(label)}</span>`).join("");
  const accessories = result.optionalAccessories.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const badges = completion.badges.length
    ? completion.badges.map((badge) => `<span class="badge">${escapeHtml(badge)}</span>`).join("")
    : `<span class="badge muted">No badges yet</span>`;

  return `
    ${renderUnsupportedContent(result.unsupportedContent)}

    ${renderPhotoGuidance(result.photoGuidance)}

    <section class="score-band" aria-label="Analysis result">
      <div>
        <p class="eyebrow">Scene type</p>
        <h2>${escapeHtml(result.sceneLabel)}</h2>
        ${renderSceneContext(result)}
        ${renderAIStatus(result.aiAnalysis)}
      </div>

      <div class="score-box">
        <span class="score-number">${result.cleanlinessScore}</span>
        <span class="score-label">clean-up score</span>
      </div>

      <div class="progress-block">
        <div class="progress-copy">
          <span>${completion.pointsEarned} / ${completion.totalAvailablePoints} points</span>
          <span>${completion.progressPercent}% done</span>
        </div>
        <div class="progress-track" aria-label="Clean-up progress">
          <span style="width: ${completion.progressPercent}%"></span>
        </div>
      </div>
    </section>

    ${completion.completed ? renderCelebration(result.sceneLabel) : ""}

    ${renderPreviewModeControl(result.aiAnalysis, previewMode)}

    ${renderGeneratedCleanedImage(result.aiAnalysis)}

    ${renderValidationStatus(result.aiAnalysis)}

    ${renderSpatialPlan(result.spatialPlan)}

    ${renderCleanupPrompt(result.cleanupPrompt)}

    <section class="actions-section" aria-labelledby="top-actions-title">
      <div class="section-heading">
        <p class="eyebrow">Quick win checklist</p>
        <h2 id="top-actions-title">Top 3 actions</h2>
      </div>
      <div class="action-grid">
        ${actions}
      </div>
    </section>

    ${renderOrganizerMap(result.organizerPlan)}

    <section class="support-grid" aria-label="Storage and preview">
      <div class="support-panel">
        <p class="eyebrow">Suggested labels</p>
        <div class="label-row">${bins}</div>
      </div>

      <div class="support-panel">
        <p class="eyebrow">Optional accessories</p>
        <ul class="compact-list">${accessories}</ul>
      </div>

      <div class="comparison-card">
        <div>
          <p class="eyebrow">Before</p>
          <div class="mini-room before-room" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <p>${escapeHtml(result.beforeAfterPreview.before)}</p>
        </div>
        <div>
          <p class="eyebrow">After potential</p>
          <div class="mini-room after-room" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <p>${escapeHtml(result.beforeAfterPreview.after)}</p>
        </div>
      </div>
    </section>

    <section class="badges-panel" aria-label="Badges">
      <p class="eyebrow">Badges</p>
      <div class="badge-row">${badges}</div>
    </section>
  `;
}

function renderGeneratedCleanedImage(aiAnalysis) {
  if (!aiAnalysis) {
    return "";
  }

  if (aiAnalysis.cleanedImage?.dataUrl) {
    return `
      <section class="cleaned-image-section" aria-labelledby="cleaned-image-title">
        <div class="section-heading cleaned-image-heading">
          <div>
            <p class="eyebrow">Generated after image</p>
            <h2 id="cleaned-image-title">Cleaned version preview</h2>
          </div>
          <span>${escapeHtml(aiAnalysis.cleanedImage.model || "image edit")}</span>
        </div>
        <img src="${escapeHtml(aiAnalysis.cleanedImage.dataUrl)}" alt="AI-generated cleaned version of the uploaded room" />
      </section>
    `;
  }

  if (aiAnalysis.cleanedImageError) {
    return `
      <section class="notice-panel compact-notice" role="status">
        <strong>Cleaned image was not generated.</strong>
        <span>${escapeHtml(aiAnalysis.cleanedImageError)}</span>
      </section>
    `;
  }

  return "";
}

function renderPreviewModeControl(aiAnalysis, previewMode) {
  if (!aiAnalysis || unsupportedContentReasons.has(aiAnalysis.unsupportedReason)) {
    return "";
  }

  if (aiAnalysis.cleanedImage?.dataUrl) {
    return "";
  }

  const buttonLabel = previewMode.isGenerating ? "Generating preview..." : "Generate cleaned preview";
  const error = previewMode.error
    ? `<span class="preview-error">${escapeHtml(previewMode.error)}</span>`
    : "";

  return `
    <section class="preview-mode-panel" aria-labelledby="preview-mode-title">
      <div>
        <p class="eyebrow">Preview mode</p>
        <h2 id="preview-mode-title">Optional cleaned image</h2>
        <p>Fast mode already gave the action plan. Generate a cleaned preview only when you want the slower image edit and validator check.</p>
        ${error}
      </div>
      <button class="secondary-button" type="button" data-generate-clean-preview ${previewMode.isGenerating ? "disabled" : ""}>
        ${escapeHtml(buttonLabel)}
      </button>
    </section>
  `;
}

function renderUnsupportedContent(unsupportedContent) {
  if (!unsupportedContent) {
    return "";
  }

  return `
    <section class="unsupported-panel" role="alert">
      <strong>${escapeHtml(unsupportedContent.title)}</strong>
      <span>${escapeHtml(unsupportedContent.message)}</span>
    </section>
  `;
}

function renderValidationStatus(aiAnalysis) {
  if (!aiAnalysis) {
    return "";
  }

  if (aiAnalysis.validationResult) {
    const result = aiAnalysis.validationResult;
    const issues = result.issues.length
      ? result.issues.map((issue) => `<li>${escapeHtml(issue.severity)}: ${escapeHtml(issue.description)}</li>`).join("")
      : "<li>No validation issues found.</li>";
    const title = result.status === "pass"
      ? "After image passed validation."
      : "After image needs review.";

    return `
      <section class="validation-panel ${result.status === "pass" ? "is-pass" : "is-fail"}" role="status">
        <strong>${title}</strong>
        <ul>${issues}</ul>
        ${result.recommended_fix ? `<span>${escapeHtml(result.recommended_fix)}</span>` : ""}
      </section>
    `;
  }

  if (aiAnalysis.validationError) {
    return `
      <section class="validation-panel is-fail" role="status">
        <strong>After image was not validated.</strong>
        <span>${escapeHtml(aiAnalysis.validationError)}</span>
      </section>
    `;
  }

  return "";
}

function renderCleanupPrompt(cleanupPrompt) {
  if (!cleanupPrompt?.category) {
    return "";
  }

  const category = cleanupPrompt.category;
  const rules = category.organization_rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("");
  const keep = category.keep.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
  const hide = category.remove_or_hide.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
  const move = category.move_to_storage.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
  const preserve = category.must_preserve.map((item) => `<span>${escapeHtml(item)}</span>`).join("");

  return `
    <section class="cleanup-prompt-section" aria-labelledby="cleanup-prompt-title">
      <div class="section-heading cleanup-heading">
        <div>
          <p class="eyebrow">Image cleanup direction</p>
          <h2 id="cleanup-prompt-title">${escapeHtml(category.name)}</h2>
        </div>
        <span>${escapeHtml(cleanupPrompt.styleOrMood)}</span>
      </div>
      <p class="scene-pattern">${escapeHtml(category.scene_pattern)}</p>
      <div class="prompt-box">
        <span>Reusable cleanup prompt</span>
        <p>${escapeHtml(cleanupPrompt.prompt)}</p>
      </div>
      <div class="cleanup-grid">
        <div>
          <p class="eyebrow">Rules</p>
          <ul>${rules}</ul>
        </div>
        <div>
          <p class="eyebrow">Keep visible</p>
          <div class="chip-row">${keep}</div>
        </div>
        <div>
          <p class="eyebrow">Remove or hide</p>
          <div class="chip-row warning-row">${hide}</div>
        </div>
        <div>
          <p class="eyebrow">Move to storage</p>
          <div class="chip-row storage-row">${move}</div>
        </div>
      </div>
      <div class="must-preserve">
        <span>Must preserve</span>
        <div class="chip-row">${preserve}</div>
      </div>
    </section>
  `;
}

function renderActionCard(action, completion) {
  const checked = completion.completedActionIds.has(action.id);
  const items = action.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const moveItems = action.placement.move.map((item) => escapeHtml(item)).join(", ");

  return `
    <article class="action-card ${checked ? "is-done" : ""}">
      <div class="action-topline">
        <label class="check-control">
          <input type="checkbox" data-action-toggle="${escapeHtml(action.id)}" ${checked ? "checked" : ""} />
          <span>${checked ? "Done" : "Do"}</span>
        </label>
        <span class="points-pill">+${action.points} pts</span>
      </div>
      <h3>${escapeHtml(action.title)}</h3>
      <p>${escapeHtml(action.reason)}</p>
      <ul>${items}</ul>
      <div class="move-plan" aria-label="Move plan">
        <div>
          <span>Move</span>
          <strong>${moveItems}</strong>
        </div>
        <div>
          <span>Where</span>
          <strong>${escapeHtml(action.placement.where)}</strong>
        </div>
        <div>
          <span>How</span>
          <strong>${escapeHtml(action.placement.how)}</strong>
        </div>
        <div>
          <span>After</span>
          <strong>${escapeHtml(action.placement.after)}</strong>
        </div>
      </div>
    </article>
  `;
}

function renderSceneContext(result) {
  if (result.sceneType === "wardrobe") {
    return `<p class="season-line">${escapeHtml(result.season.recommendation)}</p>`;
  }

  if (result.aiAnalysis) {
    return `<p class="season-line">AI detected visible clutter and mapped it to practical storage zones.</p>`;
  }

  if (result.sceneType === "bookshelf") {
    return `<p class="season-line">Bookshelf plan groups current reading, visible books, archive items, and donate items.</p>`;
  }

  return `<p class="season-line">Clutter plan prioritizes open work space, grouped small items, and a clear exit path.</p>`;
}

function renderAIStatus(aiAnalysis) {
  if (!aiAnalysis) {
    return `<span class="analysis-source local-source">Local rule-based plan</span>`;
  }

  if (unsupportedContentReasons.has(aiAnalysis.unsupportedReason)) {
    return `<span class="analysis-source local-source">Unsupported child-sensitive content</span>`;
  }

  return `
    <span class="analysis-source ai-source">
      AI organizer plan${aiAnalysis.converted ? " - HEIC converted" : ""}
    </span>
  `;
}

function renderSpatialPlan(plan) {
  const issues = plan.detected_issues.map((issue) => `<li>${escapeHtml(issue)}</li>`).join("");
  const steps = plan.organization_plan.map((step) => `
    <article class="spatial-step">
      <span>${step.step_number}</span>
      <div>
        <h3>${escapeHtml(step.action)}</h3>
        <p><strong>Destination:</strong> ${escapeHtml(step.destination)}</p>
        <p><strong>Reason:</strong> ${escapeHtml(step.reason)}</p>
      </div>
    </article>
  `).join("");

  return `
    <section class="spatial-section" aria-labelledby="spatial-title">
      <div class="section-heading spatial-heading">
        <div>
          <p class="eyebrow">Professional organizer plan</p>
          <h2 id="spatial-title">Move each category to the right zone</h2>
        </div>
        <strong>${plan.estimated_time_minutes} min</strong>
      </div>
      <div class="spatial-layout">
        <div class="issues-panel">
          <p class="eyebrow">Top messy areas</p>
          <ul>${issues}</ul>
        </div>
        <div class="spatial-steps">${steps}</div>
      </div>
    </section>
  `;
}

function renderOrganizerMap(plan) {
  const zones = plan.zones.map((zone) => `
    <article class="zone-card">
      <span>${escapeHtml(zone.name)}</span>
      <strong>${escapeHtml(zone.place)}</strong>
      <p>${escapeHtml(zone.use)}</p>
    </article>
  `).join("");

  return `
    <section class="organizer-section" aria-labelledby="organizer-title">
      <div class="section-heading">
        <p class="eyebrow">Where things should go</p>
        <h2 id="organizer-title">${escapeHtml(plan.title)}</h2>
      </div>
      <div class="zone-grid">${zones}</div>
      <div class="final-look">
        <span>Cleaned look</span>
        <strong>${escapeHtml(plan.finalLook)}</strong>
      </div>
    </section>
  `;
}

function renderPhotoGuidance(guidance) {
  if (!guidance?.needsBetterPhoto) {
    return "";
  }

  const tips = guidance.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");

  return `
    <section class="photo-guidance" role="note">
      <div>
        <p class="eyebrow">Better scan tip</p>
        <h2>${escapeHtml(guidance.title)}</h2>
      </div>
      <ul>${tips}</ul>
    </section>
  `;
}

function renderCelebration(sceneLabel) {
  return `
    <section class="celebration-panel" role="status">
      <strong>Completed this room.</strong>
      <span>${escapeHtml(sceneLabel)} reset logged. Nice and simple.</span>
    </section>
  `;
}

export function bindResultView(root, handlers) {
  root.querySelectorAll("[data-action-toggle]").forEach((input) => {
    input.addEventListener("change", (event) => {
      handlers.onToggleAction(event.target.dataset.actionToggle, event.target.checked);
    });
  });

  const previewButton = root.querySelector("[data-generate-clean-preview]");
  if (previewButton) {
    previewButton.addEventListener("click", () => {
      handlers.onGenerateCleanPreview?.();
    });
  }
}
