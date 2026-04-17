// contents/gemini-modal.tsx
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetOverlayAnchor } from "plasmo"
import { useEffect, useState } from "react"

import type { FavoriteAnswer } from "~types/favorite"
import type { SavedPrompt } from "~types/prompt"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

// Inline SVGs to avoid strict CSP and Shadow DOM boundaries
const StarIcon = ({ size = 24, fill = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
)

const BookmarkIcon = ({ size = 24, fill = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
  </svg>
)

const CloseIcon = ({ size = 24, fill = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
  </svg>
)

const DocumentIcon = ({ size = 24, fill = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
)

const OpenInNewIcon = ({ size = 18, fill = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
  </svg>
)

const ConstructionIcon = ({ size = 40, fill = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
  </svg>
)

const GeminiModal = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [favorites, setFavorites] = useState<FavoriteAnswer[]>([])
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])

  useEffect(() => {
    // 1. Tema dinleyici
    const checkTheme = () =>
      setIsDark(document.body.classList.contains("dark-theme"))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    })

    // 2. Sidebar'dan gelen "Açıl" sinyalini dinle
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent
      setActiveModal(customEvent.detail)
    }
    window.addEventListener("OPEN_GEMINI_MODAL", handleOpenModal)

    // 3. Favoriler ve Prompts storage'dan yükle
    const loadData = () => {
      chrome.storage.sync.get(
        ["gemini_favorites", "gemini_prompts"],
        (result) => {
          setFavorites(result.gemini_favorites || [])
          setPrompts(result.gemini_prompts || [])
        }
      )
    }
    loadData()

    // 4. Güncellemeleri dinle (gemini-favorites ve gemini-prompts'ten yayınlanır)
    const handleDataUpdated = () => loadData()
    window.addEventListener("FAVORITES_UPDATED", handleDataUpdated)
    window.addEventListener("PROMPTS_UPDATED", handleDataUpdated)

    return () => {
      observer.disconnect()
      window.removeEventListener("OPEN_GEMINI_MODAL", handleOpenModal)
      window.removeEventListener("FAVORITES_UPDATED", handleDataUpdated)
      window.removeEventListener("PROMPTS_UPDATED", handleDataUpdated)
    }
  }, [])

  // Favoriyi modalden sil
  const deleteFavorite = (id: string) => {
    chrome.storage.sync.get("gemini_favorites", (result) => {
      const updated = (result.gemini_favorites || []).filter(
        (f: FavoriteAnswer) => f.id !== id
      )
      chrome.storage.sync.set({ gemini_favorites: updated }, () => {
        setFavorites(updated)
        window.dispatchEvent(new CustomEvent("FAVORITES_UPDATED"))
      })
    })
  }

  // İstemi modalden sil
  const deletePrompt = (id: string) => {
    chrome.storage.sync.get("gemini_prompts", (result) => {
      const updated = (result.gemini_prompts || []).filter(
        (p: SavedPrompt) => p.id !== id
      )
      chrome.storage.sync.set({ gemini_prompts: updated }, () => {
        setPrompts(updated)
        window.dispatchEvent(new CustomEvent("PROMPTS_UPDATED"))
      })
    })
  }

  if (!activeModal) return null

  const modalTitles = {
    favorites: "Favori Cevaplar",
    notes: "My Notes",
    prompts: "İstem Kütüphanesi"
  }

  return (
    <div className={`modal-overlay ${isDark ? "dark" : ""}`}>
      <div
        className="modal-clickaway"
        onClick={() => setActiveModal(null)}></div>

      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title-container">
            <span
              className="header-icon"
              style={{
                color:
                  activeModal === "favorites"
                    ? "#fbbc04"
                    : activeModal === "prompts"
                      ? "var(--gem-sys-color--primary, #a8c7fa)"
                      : "var(--gem-sys-color--on-surface-variant)"
              }}>
              {activeModal === "favorites"
                ? <StarIcon size={32} />
                : activeModal === "prompts"
                  ? <BookmarkIcon size={32} />
                  : <DocumentIcon size={32} />}
            </span>
            <h2 className="modal-title">
              {modalTitles[activeModal as keyof typeof modalTitles]}
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="modal-close-btn"
            aria-label="Kapat">
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="modal-content">
          {(activeModal === "favorites" || activeModal === "prompts") && (
            <h3 className="list-header">En son</h3>
          )}

          {activeModal === "favorites" ? (
            favorites.length === 0 ? (
              <div className="favorites-empty">
                <span style={{ color: "var(--gem-sys-color--on-surface-variant)" }} className="modal-icon-placeholder">
                  <StarIcon size={40} />
                </span>
                <p className="modal-desc">Henüz favori yanıt kaydedilmedi.</p>
                <p className="modal-desc-sub">
                  Yanıtların altındaki ⭐ ikonuna tıklayarak favorilere
                  ekleyebilirsin.
                </p>
              </div>
            ) : (
              <ul className="item-list">
                {favorites.map((fav) => (
                  <li key={fav.id} className="list-item-container">
                    <div className="list-item-main">
                      <span className="list-item-icon star">
                        <StarIcon size={24} />
                      </span>
                      <div className="list-item-text">
                        <div className="list-item-title">{fav.text}</div>
                        <div className="list-item-metadata">
                          <span>
                            {new Date(fav.savedAt).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </span>
                          <span className="separator">•</span>
                          <a
                            href={fav.url}
                            className="favorite-link"
                            target="_blank"
                            rel="noreferrer">
                            <OpenInNewIcon size={14} />
                            Sohbete git
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="list-item-actions">
                      <button
                        className="favorite-delete-btn"
                        onClick={() => deleteFavorite(fav.id)}
                        aria-label="Sil">
                        <CloseIcon size={20} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : activeModal === "prompts" ? (
            prompts.length === 0 ? (
              <div className="favorites-empty">
                <span style={{ color: "var(--gem-sys-color--on-surface-variant)" }} className="modal-icon-placeholder">
                  <BookmarkIcon size={40} />
                </span>
                <p className="modal-desc">Henüz kayıtlı istem (prompt) yok.</p>
                <p className="modal-desc-sub">
                  Kendi yazdığınız satırların altındaki 🔖 ikonuna tıklayarak
                  istemlerinizi kaydedebilirsiniz.
                </p>
              </div>
            ) : (
              <ul className="item-list">
                {prompts.map((p) => (
                  <li key={p.id} className="list-item-container">
                    <div className="list-item-main">
                      <span className="list-item-icon bookmark">
                        <BookmarkIcon size={24} />
                      </span>
                      <div className="list-item-text">
                        <div className="list-item-title">{p.text}</div>
                        <div className="list-item-metadata">
                          <span>
                            {new Date(p.savedAt).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </span>
                          <span className="separator">•</span>
                          <a
                            href={p.url}
                            className="favorite-link"
                            target="_blank"
                            rel="noreferrer">
                            <OpenInNewIcon size={14} />
                            Sohbete git
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="list-item-actions">
                      <button
                        className="favorite-delete-btn"
                        onClick={() => deletePrompt(p.id)}
                        aria-label="Sil">
                        <CloseIcon size={20} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="favorites-empty">
              <span style={{ color: "var(--gem-sys-color--on-surface-variant)" }} className="modal-icon-placeholder">
                <ConstructionIcon size={40} />
              </span>
              <p className="modal-desc">
                {modalTitles[activeModal as keyof typeof modalTitles]} içerikleri
                yakında eklenecek...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default GeminiModal
