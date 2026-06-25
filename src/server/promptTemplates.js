import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const promptFileName = "Clutter_Cleanup_Pipeline_Prompts_Updated.md";

let cachedPromptLibrary = null;

export function loadPromptLibrary(root = process.cwd()) {
  if (cachedPromptLibrary) {
    return cachedPromptLibrary;
  }

  const promptPath = join(root, promptFileName);
  if (!existsSync(promptPath)) {
    const error = new Error(`${promptFileName} is missing from the project root.`);
    error.code = "PROMPT_FILE_MISSING";
    throw error;
  }

  const markdown = readFileSync(promptPath, "utf8");
  cachedPromptLibrary = {
    markdown,
    sections: extractPromptSections(markdown)
  };

  return cachedPromptLibrary;
}

export function extractPromptSections(markdown) {
  const headings = [...markdown.matchAll(/^##\s+(.+)$/gm)];
  const sections = {};

  headings.forEach((heading, index) => {
    const title = heading[1].trim();
    const key = normalizeHeading(title);
    const start = heading.index + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;
    sections[key] = stripSection(markdown.slice(start, end));
  });

  return sections;
}

export function buildPlannerPrompt({ city, fileName, promptLibrary = loadPromptLibrary() }) {
  const sections = promptLibrary.sections;

  return joinPromptParts([
    sections.global_rules,
    sections.planner_prompt,
    sections.child_content_policy,
    buildRuntimeContext({ city, fileName }),
    `MVP integration note:
- Treat the Child Content Policy section as authoritative.
- Children's clothes-only wardrobe and storage photos are supported when no child/person is visible.
- If unsupported child-sensitive content is present, return the error JSON requested by the Planner Prompt.
- For supported images, include at least three organization_plan entries so the app can render three quick actions.`
  ]);
}

export function buildEditorPrompt({ plannerResult, promptLibrary = loadPromptLibrary() }) {
  const sections = promptLibrary.sections;

  return joinPromptParts([
    sections.global_rules,
    sections.editor_prompt,
    sections.child_content_policy,
    `Planning JSON:
${JSON.stringify(plannerResult, null, 2)}`
  ]);
}

export function buildValidatorPrompt({ plannerResult, promptLibrary = loadPromptLibrary() }) {
  const sections = promptLibrary.sections;

  return joinPromptParts([
    sections.global_rules,
    sections.validator_prompt,
    sections.child_content_policy,
    `Planning JSON:
${JSON.stringify(plannerResult, null, 2)}`
  ]);
}

export function getUiLimitations(promptLibrary = loadPromptLibrary()) {
  return promptLibrary.sections.ui_limitations || "";
}

function buildRuntimeContext({ city, fileName }) {
  return `Runtime context:
- User city: ${city || "unknown"}.
- Image filename: ${fileName || "uploaded image"}.`;
}

function stripSection(section) {
  return section
    .replace(/^\s*---\s*$/gm, "")
    .trim();
}

function normalizeHeading(title) {
  return title
    .replace(/^\d+\)\s*/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function joinPromptParts(parts) {
  return parts
    .filter(Boolean)
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n---\n\n");
}
