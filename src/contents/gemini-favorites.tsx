// contents/gemini-favorites.tsx
import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import i18n from "../i18n"
import { TEXT_TRUNCATE_LIMIT, PULSE_ANIMATION_MS } from "../constants"
import { initLanguageSync } from "../utils/language"
import { getFavorites, saveFavorites } from "../utils/storage"
import type { FavoriteAnswer } from "~src/types/favorite"

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

// =============================================
// Style Injection (directly into <head>)
// =============================================

function injectGlobalStyles(): void {
  if (document.getElementById("gbr-favorites-style")) return
  const style = document.createElement("style")
  style.id = "gbr-favorites-style"
  style.textContent = `
    .gbr-star-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0;
      color: #c4c7c5;
      transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
      vertical-align: middle;
      position: relative;
    }

    .gbr-star-btn::after {
      content: attr(data-tooltip);
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--lumi-sys-color--on-surface, #1f1f1f);
      color: var(--lumi-sys-color--surface-dim, #f5f5f5);
      padding: var(--gem-sys-spacing--s, 8px) var(--gem-sys-spacing--l, 16px);
      border-radius: var(--gem-sys-shape--corner-medium, 8px);
      font-family: "Google Sans Flex", "Google Sans", Roboto, sans-serif;
      font-size: 12px;
      font-weight: 400;
      line-height: 16px;
      letter-spacing: 0.1px;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.15s;
      z-index: 999999;
    }

    .gbr-star-btn::before {
      content: "";
      position: absolute;
      top: calc(100% + 4px);
      left: 50%;
      transform: translateX(-50%);
      border-style: solid;
      border-color: transparent;
      border-bottom-color: var(--lumi-sys-color--on-surface, #1f1f1f);
      border-width: 0 var(--gem-sys-spacing--xs, 4px) var(--gem-sys-spacing--xs, 4px) var(--gem-sys-spacing--xs, 4px);
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.15s;
      z-index: 999999;
    }

    .gbr-star-btn:hover::after,
    .gbr-star-btn:hover::before {
      opacity: 1;
      visibility: visible;
    }

    .gbr-star-btn .google-symbols {
      font-size: 20px;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }

    .gbr-star-btn:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #fbbc04;
    }

    .gbr-star-btn.gbr-star-active {
      color: #fbbc04;
    }

    .gbr-star-btn.gbr-star-active .google-symbols {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }

    @keyframes gbr-star-pulse {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.35); }
      100% { transform: scale(1); }
    }

    .gbr-star-btn.gbr-star-pulse {
      animation: gbr-star-pulse 0.3s ease;
    }

    body:not(.dark-theme) .gbr-star-btn {
      color: #5f6368;
    }

    body:not(.dark-theme) .gbr-star-btn:hover {
      background-color: rgba(0, 0, 0, 0.06);
      color: #fbbc04;
    }

    body:not(.dark-theme) .gbr-star-btn.gbr-star-active {
      color: #f9ab00;
    }
  `
  document.head.appendChild(style)
}

// =============================================
// DOM Helpers
// =============================================

function getResponseId(thumbUpButtonEl: Element): string | null {
  const button = thumbUpButtonEl.querySelector("button[jslog]")
  if (!button) return null
  const jslog = button.getAttribute("jslog") || ""
  // jslog format: '173913;...BardVeMetadataKey:[[\"r_XXXX\",\"c_YYYY\",...]]'
  const match = jslog.match(/"(r_[a-z0-9]+)"/)
  return match ? match[1] : null
}

function getConversationId(thumbUpButtonEl: Element): string | null {
  const button = thumbUpButtonEl.querySelector("button[jslog]")
  if (!button) return null
  const jslog = button.getAttribute("jslog") || ""
  const match = jslog.match(/"r_[a-z0-9]+","(c_[a-z0-9]+)"/)
  return match ? match[1] : null
}

function getResponseText(responseId: string): string {
  const contentEl = document.getElementById(`message-content-id-${responseId}`)
  if (!contentEl) return ""
  const rawText = (contentEl as HTMLElement).innerText?.trim() || ""
  // Truncate for UI performance and UX
  return rawText.slice(0, TEXT_TRUNCATE_LIMIT) + (rawText.length > TEXT_TRUNCATE_LIMIT ? "..." : "")
}

// =============================================
// Favorite Toggle Logic
// =============================================

async function toggleFavorite(
  responseId: string,
  conversationId: string,
  text: string
): Promise<boolean> {
  const favorites = await getFavorites()
  const existingIndex = favorites.findIndex((f) => f.id === responseId)

  if (existingIndex !== -1) {
    // Already favorited — remove
    favorites.splice(existingIndex, 1)
    await saveFavorites(favorites)
    window.dispatchEvent(new CustomEvent("FAVORITES_UPDATED"))
    return false
  } else {
    // Add to favorites (prepend)
    const newFavorite: FavoriteAnswer = {
      id: responseId,
      text,
      conversationId,
      savedAt: Date.now(),
      url: window.location.href
    }
    favorites.unshift(newFavorite)
    await saveFavorites(favorites)
    window.dispatchEvent(new CustomEvent("FAVORITES_UPDATED"))
    return true
  }
}

// =============================================
// Button Creator
// =============================================

function createStarButton(
  responseId: string,
  isFavorited: boolean
): HTMLButtonElement {
  const btn = document.createElement("button")
  btn.className = `gbr-star-btn${isFavorited ? " gbr-star-active" : ""}`
  btn.setAttribute("data-response-id", responseId)
  btn.setAttribute(
    "aria-label",
    isFavorited ? i18n.t("removeFromFavorites") : i18n.t("addToFavorites")
  )
  btn.setAttribute(
    "data-tooltip",
    isFavorited ? i18n.t("removeFromFavorites") : i18n.t("addToFavorites")
  )
  btn.innerHTML = `<span class="google-symbols">star</span>`
  return btn
}

// =============================================
// Injection Logic
// =============================================

function injectStarButton(
  thumbUpButtonEl: Element,
  favorites: FavoriteAnswer[]
): void {
  const responseId = getResponseId(thumbUpButtonEl)
  if (!responseId) return

  const container = thumbUpButtonEl.closest(".buttons-container-v2")
  if (!container) return

  // Skip if already injected
  if (container.querySelector(`[data-response-id="${responseId}"]`)) return

  const conversationId = getConversationId(thumbUpButtonEl) || ""
  const isFavorited = favorites.some((f) => f.id === responseId)

  const btn = createStarButton(responseId, isFavorited)

  btn.addEventListener("click", async (e) => {
    e.stopPropagation()
    const text = getResponseText(responseId)
    const nowFavorited = await toggleFavorite(responseId, conversationId, text)

    btn.classList.toggle("gbr-star-active", nowFavorited)
    btn.setAttribute(
      "aria-label",
      nowFavorited ? i18n.t("removeFromFavorites") : i18n.t("addToFavorites")
    )
    btn.setAttribute(
      "data-tooltip",
      nowFavorited ? i18n.t("removeFromFavorites") : i18n.t("addToFavorites")
    )

    // Visual feedback animation
    btn.classList.add("gbr-star-pulse")
    setTimeout(() => btn.classList.remove("gbr-star-pulse"), PULSE_ANIMATION_MS)
  })

  // Insert before the thumb-up button
  thumbUpButtonEl.insertAdjacentElement("beforebegin", btn)
}

function observeMessageActions(): () => void {
  const processAll = async () => {
    const thumbUpButtons = Array.from(
      document.querySelectorAll("thumb-up-button:not([data-gbr-processed])")
    )

    if (thumbUpButtons.length === 0) return

    // Mark immediately to prevent duplicate processing from concurrent mutations
    for (const el of thumbUpButtons) {
      el.setAttribute("data-gbr-processed", "true")
    }

    const favorites = await getFavorites()

    for (const el of thumbUpButtons) {
      injectStarButton(el, favorites)
    }
  }

  // Initial load
  processAll()

  // Re-process when new responses are added to the DOM
  const observer = new MutationObserver(() => {
    processAll()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  return () => observer.disconnect()
}

// =============================================
// React Component (required by Plasmo)
// This component does not render any UI.
// =============================================

const GeminiFavorites = () => {
  useEffect(() => {
    const cleanupLang = initLanguageSync(i18n)
    injectGlobalStyles()
    const cleanupObserver = observeMessageActions()
    return () => {
      cleanupObserver()
      cleanupLang()
    }
  }, [])

  return null
}

export default GeminiFavorites
