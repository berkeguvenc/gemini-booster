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
          <h2 className="modal-title">
            {modalTitles[activeModal as keyof typeof modalTitles]}
          </h2>
          <button
            onClick={() => setActiveModal(null)}
            className="modal-close-btn">
            <span className="google-symbols">close</span>
          </button>
        </div>

        {/* Favori Cevaplar Modal İçeriği */}
        {activeModal === "favorites" ? (
          <div className="modal-content favorites-list">
            {favorites.length === 0 ? (
              <div className="favorites-empty">
                <span className="google-symbols modal-icon-placeholder">
                  star
                </span>
                <p className="modal-desc">Henüz favori yanıt kaydedilmedi.</p>
                <p className="modal-desc-sub">
                  Yanıtların altındaki ⭐ ikonuna tıklayarak favorilere
                  ekleyebilirsin.
                </p>
              </div>
            ) : (
              <ul className="favorites-list-ul">
                {favorites.map((fav) => (
                  <li key={fav.id} className="favorite-item">
                    <div className="favorite-item-header">
                      <span className="google-symbols favorite-star-icon">
                        star
                      </span>
                      <span className="favorite-date">
                        {new Date(fav.savedAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                      <button
                        className="favorite-delete-btn"
                        onClick={() => deleteFavorite(fav.id)}
                        aria-label="Favoriden çıkar">
                        <span className="google-symbols">close</span>
                      </button>
                    </div>
                    <p className="favorite-text">{fav.text}</p>
                    <a
                      href={fav.url}
                      className="favorite-link"
                      target="_blank"
                      rel="noreferrer">
                      <span className="google-symbols">open_in_new</span>
                      Sohbete git
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : activeModal === "prompts" ? (
          <div className="modal-content favorites-list">
            {prompts.length === 0 ? (
              <div className="favorites-empty">
                <span className="google-symbols modal-icon-placeholder">
                  bookmark
                </span>
                <p className="modal-desc">Henüz kayıtlı istem (prompt) yok.</p>
                <p className="modal-desc-sub">
                  Kendi yazdığınız sınırların (istemlerin) altındaki 🔖 ikonuna
                  tıklayarak istemlerinizi kaydedebilirsiniz.
                </p>
              </div>
            ) : (
              <ul className="favorites-list-ul">
                {prompts.map((p) => (
                  <li key={p.id} className="favorite-item">
                    <div className="favorite-item-header">
                      <span
                        className="google-symbols favorite-star-icon"
                        style={{
                          color: "var(--gem-sys-color--primary, #a8c7fa)"
                        }}>
                        bookmark
                      </span>
                      <span className="favorite-date">
                        {new Date(p.savedAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                      <button
                        className="favorite-delete-btn"
                        onClick={() => deletePrompt(p.id)}
                        aria-label="İstemi sil">
                        <span className="google-symbols">close</span>
                      </button>
                    </div>
                    {/* Prompt'lar genelde daha sade bir tasarımla render edilebilir */}
                    <p
                      className="favorite-text"
                      style={{
                        fontStyle: "italic",
                        borderLeft: "2px solid var(--gem-sys-color--primary)",
                        paddingLeft: "12px"
                      }}>
                      "{p.text}"
                    </p>
                    <a
                      href={p.url}
                      className="favorite-link"
                      target="_blank"
                      rel="noreferrer">
                      <span className="google-symbols">open_in_new</span>
                      Sohbete git
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          /* Notes Modali için placeholder */
          <div className="modal-content">
            <span className="google-symbols modal-icon-placeholder">
              construction
            </span>
            <p className="modal-desc">
              {modalTitles[activeModal as keyof typeof modalTitles]} içerikleri
              yakında eklenecek...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
export default GeminiModal
