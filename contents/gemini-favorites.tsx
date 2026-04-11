// contents/gemini-favorites.tsx
import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import type { FavoriteAnswer } from "~types/favorite"

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

// =============================================
// Stil Enjeksiyonu (doğrudan <head>'e)
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
      top: 115%;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--gem-sys-color--inverse-surface, #303030);
      color: var(--gem-sys-color--inverse-on-surface, #f5f5f5);
      padding: 4px 8px;
      border-radius: 4px;
      font-family: "Google Sans", "Google Sans Flex", Roboto, sans-serif;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.1px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
      z-index: 999999;
    }

    .gbr-star-btn:hover::after {
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
// Storage Yardımcıları
// =============================================

async function getFavorites(): Promise<FavoriteAnswer[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get("gemini_favorites", (result) => {
      resolve(result.gemini_favorites || [])
    })
  })
}

async function saveFavorites(favorites: FavoriteAnswer[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ gemini_favorites: favorites }, resolve)
  })
}

// =============================================
// DOM Yardımcıları
// =============================================

function getResponseId(thumbUpButtonEl: Element): string | null {
  const button = thumbUpButtonEl.querySelector("button[jslog]")
  if (!button) return null
  const jslog = button.getAttribute("jslog") || ""
  // jslog: '173913;...BardVeMetadataKey:[["r_XXXX","c_YYYY",...]]'
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
  // 500 karakter limiti (chrome.storage.sync 8 KB limiti için)
  return rawText.slice(0, 500) + (rawText.length > 500 ? "..." : "")
}

// =============================================
// Favori Toggle Mantığı
// =============================================

async function toggleFavorite(
  responseId: string,
  conversationId: string,
  text: string
): Promise<boolean> {
  const favorites = await getFavorites()
  const existingIndex = favorites.findIndex((f) => f.id === responseId)

  if (existingIndex !== -1) {
    // Zaten favoride → kaldır
    favorites.splice(existingIndex, 1)
    await saveFavorites(favorites)
    window.dispatchEvent(new CustomEvent("FAVORITES_UPDATED"))
    return false
  } else {
    // Favoriye ekle (en başa)
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
// Buton Oluşturucu
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
    isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"
  )
  btn.setAttribute(
    "data-tooltip",
    isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"
  )
  btn.innerHTML = `<span class="google-symbols">star</span>`
  return btn
}

// =============================================
// Enjeksiyon Mantığı
// =============================================

function injectStarButton(
  thumbUpButtonEl: Element,
  favorites: FavoriteAnswer[]
): void {
  const responseId = getResponseId(thumbUpButtonEl)
  if (!responseId) return

  const container = thumbUpButtonEl.closest(".buttons-container-v2")
  if (!container) return

  // Daha önce enjekte edildiyse atla
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
      nowFavorited ? "Favorilerden çıkar" : "Favorilere ekle"
    )
    btn.setAttribute(
      "data-tooltip",
      nowFavorited ? "Favorilerden çıkar" : "Favorilere ekle"
    )

    // Görsel geri bildirim animasyonu
    btn.classList.add("gbr-star-pulse")
    setTimeout(() => btn.classList.remove("gbr-star-pulse"), 300)
  })

  // thumb-up-button'ın hemen soluna yerleştir
  thumbUpButtonEl.insertAdjacentElement("beforebegin", btn)
}

function observeMessageActions(): () => void {
  const processAll = async () => {
    const thumbUpButtons = Array.from(
      document.querySelectorAll("thumb-up-button:not([data-gbr-processed])")
    )

    if (thumbUpButtons.length === 0) return

    // Hepsini asenkron çağırmadân önce anında işaretle ki, diğer mutation'lar bunları kapmasın.
    for (const el of thumbUpButtons) {
      el.setAttribute("data-gbr-processed", "true")
    }

    const favorites = await getFavorites()

    for (const el of thumbUpButtons) {
      injectStarButton(el, favorites)
    }
  }

  // İlk yükleme
  processAll()

  // Yeni yanıtlar DOM'a eklendiğinde tetiklenir
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
// React Bileşeni (Plasmo zorunluluğu)
// Bu bileşen herhangi bir UI render etmez.
// =============================================

const GeminiFavorites = () => {
  useEffect(() => {
    injectGlobalStyles()
    const cleanup = observeMessageActions()
    return cleanup
  }, [])

  return null
}

export default GeminiFavorites
