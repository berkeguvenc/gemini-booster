import type { PlasmoCSConfig } from "plasmo";
import { useEffect } from "react";

import i18n from "../i18n";
import { TEXT_TRUNCATE_LIMIT, PULSE_ANIMATION_MS } from "../constants";
import { initLanguageSync } from "../utils/language";
import { getFavorites, saveFavorites } from "../utils/storage";

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
};

// --- STYLES ---
function injectStyles() {
  if (document.getElementById("gb-fav-btn-styles")) return;
  const style = document.createElement("style");
  style.id = "gb-fav-btn-styles";
  style.textContent = `
    /* Light Theme (Default) */
    :root {
      --gb-fav-color: #5f6368;
      --gb-fav-hover-bg: rgba(0, 0, 0, 0.06);
      --gb-fav-hover-color: #fbbc04;
      --gb-fav-active: #f9ab00;
      
      --gb-tooltip-bg: #1f1f1f;
      --gb-tooltip-color: #f5f5f5;
    }

    /* Dark Theme Override */
    body.dark-theme {
      --gb-fav-color: #c4c7c5;
      --gb-fav-hover-bg: rgba(255, 255, 255, 0.08);
      --gb-fav-hover-color: #fbbc04;
      --gb-fav-active: #fbbc04;
      
      --gb-tooltip-bg: #e3e3e3;
      --gb-tooltip-color: #1f1f1f;
    }

    /* Action Button */
    .gb-fav-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 50%;
      background-color: transparent;
      color: var(--gb-fav-color);
      cursor: pointer;
      padding: 0;
      transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
      vertical-align: middle;
    }

    .gb-fav-btn:hover {
      background-color: var(--gb-fav-hover-bg);
      color: var(--gb-fav-hover-color);
    }

    .gb-fav-btn.is-active {
      color: var(--gb-fav-active);
    }

    .gb-fav-btn .google-symbols {
      font-size: 20px;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }

    .gb-fav-btn.is-active .google-symbols {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }

    /* Tooltip Base */
    .gb-fav-btn::before,
    .gb-fav-btn::after {
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
    .gb-fav-btn::before {
      content: "";
      top: calc(100% + 4px);
      border-style: solid;
      border-color: transparent;
      border-bottom-color: var(--gb-tooltip-bg);
      border-width: 0 4px 4px 4px;
    }

    /* Tooltip Body */
    .gb-fav-btn::after {
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

    .gb-fav-btn:hover::before,
    .gb-fav-btn:hover::after {
      opacity: 1;
      visibility: visible;
    }

    /* Pulse Animation */
    @keyframes gb-fav-pulse-anim {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.35); }
      100% { transform: scale(1); }
    }

    .gb-fav-btn.is-pulsing {
      animation: gb-fav-pulse-anim 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}

// --- DOM EXTRACTORS ---
const getResponseId = (el: Element) => {
  const btn = el.querySelector("button[jslog]");
  return btn?.getAttribute("jslog")?.match(/"(r_[a-z0-9]+)"/)?.[1];
};

const getConversationId = (el: Element) => {
  const btn = el.querySelector("button[jslog]");
  return btn?.getAttribute("jslog")?.match(/"r_[a-z0-9]+","(c_[a-z0-9]+)"/)?.[1];
};

const extractResponseText = (responseId: string): string => {
  const contentEl = document.getElementById(`message-content-id-${responseId}`);
  if (!contentEl) return "";
  const rawText = contentEl.innerText?.trim() || "";
  return rawText.length > TEXT_TRUNCATE_LIMIT ? rawText.slice(0, TEXT_TRUNCATE_LIMIT) + "..." : rawText;
};

// --- LOGIC ---
async function toggleFavoriteState(btn: HTMLButtonElement, responseId: string, conversationId: string, text: string) {
  const favorites = await getFavorites();
  const index = favorites.findIndex(f => f.id === responseId);
  const isCurrentlySaved = index !== -1;

  if (isCurrentlySaved) {
    favorites.splice(index, 1);
  } else {
    favorites.unshift({
      id: responseId,
      text,
      conversationId,
      savedAt: Date.now(),
      url: window.location.href
    });
  }

  await saveFavorites(favorites);
  window.dispatchEvent(new CustomEvent("FAVORITES_UPDATED"));

  const nowFavorited = !isCurrentlySaved;
  btn.classList.toggle("is-active", nowFavorited);

  const label = nowFavorited ? i18n.t("removeFromFavorites") : i18n.t("addToFavorites");
  btn.setAttribute("aria-label", label);
  btn.setAttribute("data-gb-tooltip", label);

  btn.classList.add("is-pulsing");
  setTimeout(() => btn.classList.remove("is-pulsing"), PULSE_ANIMATION_MS || 300);
}

// --- INJECTION ---
function mountButtonTo(thumbUpBtn: Element, favoritedIds: Set<string>) {
  const responseId = getResponseId(thumbUpBtn);
  if (!responseId || thumbUpBtn.hasAttribute("data-gb-mounted")) return;

  const containerWrapper = thumbUpBtn.closest(".buttons-container-v2");
  if (!containerWrapper) return;

  // Mark immediately to prevent race conditions during async operations
  thumbUpBtn.setAttribute("data-gb-mounted", "true");

  const conversationId = getConversationId(thumbUpBtn) || "";
  const isFavorited = favoritedIds.has(responseId);
  const label = isFavorited ? i18n.t("removeFromFavorites") : i18n.t("addToFavorites");

  const btn = document.createElement("button");
  btn.className = `gb-fav-btn ${isFavorited ? "is-active" : ""}`;
  btn.setAttribute("aria-label", label);
  btn.setAttribute("data-gb-tooltip", label);
  btn.innerHTML = `<span class="google-symbols">star</span>`;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const text = extractResponseText(responseId);
    if (text) toggleFavoriteState(btn, responseId, conversationId, text);
  });

  thumbUpBtn.insertAdjacentElement("beforebegin", btn);
}

// --- OBSERVER ---
function initObserver() {
  let isProcessing = false;

  const processDOM = async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      // Find thumb-up buttons that haven't been processed
      const thumbUpBtns = Array.from(document.querySelectorAll("thumb-up-button:not([data-gb-mounted])"));
      if (thumbUpBtns.length === 0) return;

      const favorites = await getFavorites();
      // O(1) Set lookup for favorited IDs
      const favoritedIds = new Set(favorites.map(f => f.id));

      thumbUpBtns.forEach(btn => mountButtonTo(btn, favoritedIds));
    } finally {
      isProcessing = false;
    }
  };

  // Initial process
  processDOM();

  const observer = new MutationObserver((mutations) => {
    // Process only if real nodes were added
    if (mutations.some(m => m.addedNodes.length > 0)) {
      requestAnimationFrame(processDOM);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

// --- MAIN COMPONENT ---
export default function GeminiFavorites() {
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
