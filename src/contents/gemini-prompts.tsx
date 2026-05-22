// contents/gemini-prompts.tsx
import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import i18n from "../i18n"
import { TEXT_TRUNCATE_LIMIT, PULSE_ANIMATION_MS } from "../constants"
import { initLanguageSync } from "../utils/language"
import { getPrompts, savePrompts } from "../utils/storage"
import type { SavedPrompt } from "~src/types/prompt"

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

// =============================================
// Style Injection
// =============================================

function injectGlobalStyles(): void {
  if (document.getElementById("gbr-prompts-style")) return
  const style = document.createElement("style")
  style.id = "gbr-prompts-style"
  style.textContent = `
    .gbr-prompt-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0;
      color: var(--gem-sys-color--on-surface-variant, #c4c7c5);
      transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
      vertical-align: middle;
      margin-right: 4px;
      position: relative;
    }

    .gbr-prompt-btn::after {
      content: attr(data-tooltip);
      position: absolute;
      top: 120%;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--gem-sys-color--inverse-surface, #303030);
      color: var(--gem-sys-color--inverse-on-surface, #f5f5f5);
      padding: 4px 8px;
      border-radius: 4px;
      font-family: "Google Sans", "Google Sans Flex", Roboto, sans-serif;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.1px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
      z-index: 999999;
    }

    .gbr-prompt-btn:hover::after {
      opacity: 1;
      visibility: visible;
    }

    .gbr-prompt-btn .google-symbols {
      font-size: 20px;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }

    .gbr-prompt-btn:hover {
      background-color: var(--gem-sys-color--surface-container-highest, rgba(255, 255, 255, 0.08));
      color: var(--gem-sys-color--on-surface, #e3e3e3);
    }

    .gbr-prompt-btn.gbr-prompt-active {
      color: var(--gem-sys-color--primary, #a8c7fa);
    }

    .gbr-prompt-btn.gbr-prompt-active .google-symbols {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }

    @keyframes gbr-prompt-pulse {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.35); }
      100% { transform: scale(1); }
    }

    .gbr-prompt-btn.gbr-prompt-pulse {
      animation: gbr-prompt-pulse 0.3s ease;
    }

    /* Wrapper — hidden by default, visible on hover */
    .gbr-prompt-wrapper {
      display: inline-flex;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    /* Show when hovering the prompt row */
    .user-query-container:hover .gbr-prompt-wrapper,
    .luminous-actions-container:focus-within .gbr-prompt-wrapper {
      opacity: 1;
    }
  `
  document.head.appendChild(style)
}

// =============================================
// DOM Helpers
// =============================================

function getResponseId(copyBtnEl: Element): string | null {
  const jslog = copyBtnEl.getAttribute("jslog") || ""
  const match = jslog.match(/"(r_[a-z0-9]+)"/)
  return match ? match[1] : null
}

function getConversationId(copyBtnEl: Element): string | null {
  const jslog = copyBtnEl.getAttribute("jslog") || ""
  const match = jslog.match(/"r_[a-z0-9]+","(c_[a-z0-9]+)"/)
  return match ? match[1] : null
}

function getPromptText(copyBtnEl: Element): string {
  const queryContainer = copyBtnEl.closest(".user-query-container")
  if (!queryContainer) return ""

  const queryTextEl = queryContainer.querySelector(".query-text")
  if (!queryTextEl) return ""

  // Clone to strip hidden elements like cdk-visually-hidden
  const clone = queryTextEl.cloneNode(true) as HTMLElement
  const hiddenElements = clone.querySelectorAll(".cdk-visually-hidden")
  hiddenElements.forEach((el) => el.remove())

  const rawText = clone.innerText?.trim() || ""
  // Enforce storage limit
  return rawText.slice(0, TEXT_TRUNCATE_LIMIT) + (rawText.length > TEXT_TRUNCATE_LIMIT ? "..." : "")
}

// =============================================
// Prompt Toggle Logic
// =============================================

async function togglePrompt(
  promptId: string,
  conversationId: string,
  text: string
): Promise<boolean> {
  const prompts = await getPrompts()
  const existingIndex = prompts.findIndex((p) => p.id === promptId)

  if (existingIndex !== -1) {
    // Already saved — remove
    prompts.splice(existingIndex, 1)
    await savePrompts(prompts)
    window.dispatchEvent(new CustomEvent("PROMPTS_UPDATED"))
    return false
  } else {
    // Save (prepend)
    const newPrompt: SavedPrompt = {
      id: promptId,
      text,
      conversationId,
      savedAt: Date.now(),
      url: window.location.href
    }
    prompts.unshift(newPrompt)
    await savePrompts(prompts)
    window.dispatchEvent(new CustomEvent("PROMPTS_UPDATED"))
    return true
  }
}

// =============================================
// Button Creator
// =============================================

function createPromptButton(
  promptId: string,
  isSaved: boolean
): HTMLButtonElement {
  const btn = document.createElement("button")
  btn.className = `gbr-prompt-btn${isSaved ? " gbr-prompt-active" : ""}`
  btn.setAttribute("data-prompt-id", promptId)
  btn.setAttribute("aria-label", isSaved ? i18n.t("removePrompt") : i18n.t("savePrompt"))
  btn.setAttribute("data-tooltip", isSaved ? i18n.t("removePrompt") : i18n.t("savePrompt"))
  btn.innerHTML = `<span class="google-symbols">bookmark</span>`
  return btn
}

// =============================================
// Injection Logic
// =============================================

function injectPromptButton(copyBtnEl: Element, prompts: SavedPrompt[]): void {
  const promptId = getResponseId(copyBtnEl)
  if (!promptId) return

  const queryContainer = copyBtnEl.closest(".user-query-container")
  if (!queryContainer) return

  // Prevent duplicate injection
  if (queryContainer.querySelector(`[data-prompt-id="${promptId}"]`)) return

  // Find the gem-icon-button sibling wrapper to insert beside
  const gemIconButton = copyBtnEl.closest("gem-icon-button")
  if (!gemIconButton) return

  const conversationId = getConversationId(copyBtnEl) || ""
  const isSaved = prompts.some((p) => p.id === promptId)

  const btnWrapper = document.createElement("div")
  btnWrapper.className = "ng-star-inserted gbr-prompt-wrapper"

  const btn = createPromptButton(promptId, isSaved)

  btn.addEventListener("click", async (e) => {
    e.stopPropagation()
    const text = getPromptText(copyBtnEl)
    if (!text) return

    const nowSaved = await togglePrompt(promptId, conversationId, text)

    btn.classList.toggle("gbr-prompt-active", nowSaved)
    btn.setAttribute("aria-label", nowSaved ? i18n.t("removePrompt") : i18n.t("savePrompt"))
    btn.setAttribute(
      "data-tooltip",
      nowSaved ? i18n.t("removePrompt") : i18n.t("savePrompt")
    )

    // Visual feedback
    btn.classList.add("gbr-prompt-pulse")
    setTimeout(() => btn.classList.remove("gbr-prompt-pulse"), PULSE_ANIMATION_MS)
  })

  btnWrapper.appendChild(btn)
  gemIconButton.insertAdjacentElement("beforebegin", btnWrapper)
}

// =============================================
// MutationObserver
// =============================================

function observePromptActions(): () => void {
  const processAll = async () => {
    // Target the "Copy prompt" buttons under prompt-copy-button test ID
    const copyButtons = Array.from(
      document.querySelectorAll(
        '[data-test-id="prompt-copy-button"] button:not([data-gbr-prompt-processed])'
      )
    )

    if (copyButtons.length === 0) return

    // Mark synchronously to prevent concurrent mutation races
    for (const el of copyButtons) {
      el.setAttribute("data-gbr-prompt-processed", "true")
    }

    const prompts = await getPrompts()

    for (const el of copyButtons) {
      injectPromptButton(el, prompts)
    }
  }

  processAll()

  const observer = new MutationObserver(() => {
    processAll()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  return () => observer.disconnect()
}

const GeminiPrompts = () => {
  useEffect(() => {
    const cleanupLang = initLanguageSync(i18n)
    injectGlobalStyles()
    const cleanupObserver = observePromptActions()
    return () => {
      cleanupObserver()
      cleanupLang()
    }
  }, [])

  return null
}

export default GeminiPrompts
