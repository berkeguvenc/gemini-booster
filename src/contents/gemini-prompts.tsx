import type { PlasmoCSConfig } from "plasmo";
import { useEffect } from "react";

import i18n from "../i18n";
import { TEXT_TRUNCATE_LIMIT, PULSE_ANIMATION_MS } from "../constants";
import { initLanguageSync } from "../utils/language";
import { getPrompts, savePrompts } from "../utils/storage";

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
};

// --- STYLES ---
function injectStyles() {
  if (document.getElementById("gb-save-btn-styles")) return;
  const style = document.createElement("style");
  style.id = "gb-save-btn-styles";
  style.textContent = `
    /* Light Theme (Default) */
    :root {
      --gb-btn-color: #444746;
      --gb-btn-bg: rgba(255, 255, 255, 0.34);
      --gb-btn-hover-bg: rgba(0, 0, 0, 0.08);
      --gb-btn-hover-color: #1f1f1f;
      --gb-btn-active: #0b57d0;
      
      --gb-tooltip-bg: #1f1f1f;
      --gb-tooltip-color: #f5f5f5;
    }

    /* Dark Theme Override */
    body.dark-theme {
      --gb-btn-color: #c4c7c5;
      --gb-btn-bg: rgba(31, 31, 31, 0.34);
      --gb-btn-hover-bg: rgba(255, 255, 255, 0.08);
      --gb-btn-hover-color: #e3e3e3;
      --gb-btn-active: #a8c7fa;
      
      --gb-tooltip-bg: #e3e3e3;
      --gb-tooltip-color: #1f1f1f;
    }

    /* Container */
    .gb-save-container {
      display: inline-flex;
      opacity: 0;
      transition: opacity 0.2s ease;
      vertical-align: middle;
    }

    /* Show when parent row is hovered or focused */
    .user-query-container:hover .gb-save-container,
    .luminous-actions-container:focus-within .gb-save-container,
    .gb-save-container:focus-within {
      opacity: 1;
    }

    /* Action Button */
    .gb-save-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background-color: var(--gb-btn-bg);
      color: var(--gb-btn-color);
      cursor: pointer;
      padding: 0;
      transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
    }

    .gb-save-btn:hover {
      background-color: var(--gb-btn-hover-bg);
      color: var(--gb-btn-hover-color);
    }

    .gb-save-btn.is-active {
      color: var(--gb-btn-active);
    }

    .gb-save-btn .google-symbols {
      font-size: 20px;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }

    .gb-save-btn.is-active .google-symbols {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }

    /* Tooltip Base */
    .gb-save-btn::before,
    .gb-save-btn::after {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.15s;
      z-index: 999999;
    }

    /* Tooltip Arrow */
    .gb-save-btn::before {
      content: "";
      top: calc(100% + 4px);
      border-style: solid;
      border-color: transparent;
      border-bottom-color: var(--gb-tooltip-bg);
      border-width: 0 4px 4px 4px;
    }

    /* Tooltip Body */
    .gb-save-btn::after {
      content: attr(data-gb-tooltip);
      top: calc(100% + 8px);
      background-color: var(--gb-tooltip-bg);
      color: var(--gb-tooltip-color);
      padding: 8px 16px;
      border-radius: 12px;
      font-family: "Google Sans Flex", "Google Sans", Roboto, sans-serif;
      font-size: 12px;
      font-weight: 400;
      line-height: 16px;
      letter-spacing: 0.1px;
      white-space: nowrap;
      box-shadow: 0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15);
    }

    .gb-save-btn:hover::before,
    .gb-save-btn:hover::after {
      opacity: 1;
      visibility: visible;
    }

    /* Pulse Animation */
    @keyframes gb-pulse-anim {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.35); }
      100% { transform: scale(1); }
    }

    .gb-save-btn.is-pulsing {
      animation: gb-pulse-anim 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}

// --- DOM EXTRACTORS ---
const getResponseId = (el: Element) => el.getAttribute("jslog")?.match(/"(r_[a-z0-9]+)"/)?.[1];
const getConversationId = (el: Element) => el.getAttribute("jslog")?.match(/"r_[a-z0-9]+","(c_[a-z0-9]+)"/)?.[1];

const extractQueryText = (copyBtn: Element): string => {
  const queryContainer = copyBtn.closest(".user-query-container");
  if (!queryContainer) return "";

  const queryTextEl = queryContainer.querySelector(".query-text");
  if (!queryTextEl) return "";

  // Clone to cleanly remove visually hidden angular elements without affecting the real DOM
  const clone = queryTextEl.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".cdk-visually-hidden").forEach(n => n.remove());

  const text = clone.innerText?.trim() || "";
  return text.length > TEXT_TRUNCATE_LIMIT ? text.slice(0, TEXT_TRUNCATE_LIMIT) + "..." : text;
};

// --- LOGIC ---
async function toggleSaveState(btn: HTMLButtonElement, promptId: string, conversationId: string, text: string) {
  const prompts = await getPrompts();
  const index = prompts.findIndex(p => p.id === promptId);
  const isCurrentlySaved = index !== -1;

  if (isCurrentlySaved) {
    prompts.splice(index, 1);
  } else {
    prompts.unshift({
      id: promptId,
      text,
      conversationId,
      savedAt: Date.now(),
      url: window.location.href
    });
  }

  await savePrompts(prompts);
  window.dispatchEvent(new CustomEvent("PROMPTS_UPDATED"));

  const nowSaved = !isCurrentlySaved;
  btn.classList.toggle("is-active", nowSaved);

  const label = nowSaved ? i18n.t("removePrompt") : i18n.t("savePrompt");
  btn.setAttribute("aria-label", label);
  btn.setAttribute("data-gb-tooltip", label);

  btn.classList.add("is-pulsing");
  setTimeout(() => btn.classList.remove("is-pulsing"), PULSE_ANIMATION_MS || 300);
}

// --- INJECTION ---
function mountButtonTo(copyBtn: Element, savedIds: Set<string>) {
  const promptId = getResponseId(copyBtn);
  if (!promptId || copyBtn.hasAttribute("data-gb-mounted")) return;

  const iconButtonSibling = copyBtn.closest("gem-icon-button");
  if (!iconButtonSibling) return;

  // Mark immediately to prevent race conditions during async operations
  copyBtn.setAttribute("data-gb-mounted", "true");

  const conversationId = getConversationId(copyBtn) || "";
  const isSaved = savedIds.has(promptId);
  const label = isSaved ? i18n.t("removePrompt") : i18n.t("savePrompt");

  const container = document.createElement("div");
  container.className = "gb-save-container ng-star-inserted";

  const btn = document.createElement("button");
  btn.className = `gb-save-btn ${isSaved ? "is-active" : ""}`;
  btn.setAttribute("aria-label", label);
  btn.setAttribute("data-gb-tooltip", label);
  btn.innerHTML = `<span class="google-symbols">bookmark</span>`;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const text = extractQueryText(copyBtn);
    if (text) toggleSaveState(btn, promptId, conversationId, text);
  });

  container.appendChild(btn);
  iconButtonSibling.insertAdjacentElement("beforebegin", container);
}

// --- OBSERVER ---
function initObserver() {
  let isProcessing = false;

  const processDOM = async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      const copyBtns = Array.from(document.querySelectorAll('[data-test-id="prompt-copy-button"] button:not([data-gb-mounted])'));
      if (copyBtns.length === 0) return;

      const prompts = await getPrompts();
      // Use O(1) Set for faster lookups
      const savedIds = new Set(prompts.map(p => p.id));

      copyBtns.forEach(btn => mountButtonTo(btn, savedIds));
    } finally {
      isProcessing = false;
    }
  };

  // Initial process
  processDOM();

  const observer = new MutationObserver((mutations) => {
    // Only process if elements were added to the DOM (efficient filtering)
    if (mutations.some(m => m.addedNodes.length > 0)) {
      requestAnimationFrame(processDOM);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

// --- MAIN COMPONENT ---
export default function GeminiSavePrompt() {
  useEffect(() => {
    const cleanupLang = initLanguageSync(i18n);
    injectStyles();
    const cleanupObserver = initObserver();

    return () => {
      cleanupObserver();
      cleanupLang();
    };
  }, []);

  return null;
}
