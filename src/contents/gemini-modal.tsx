// contents/gemini-modal.tsx
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetOverlayAnchor } from "plasmo"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import "../i18n"

import type { FavoriteAnswer } from "../types/favorite"
import type { Note } from "../types/note"
import type { SavedPrompt } from "../types/prompt"

import {
  StarIcon,
  BookmarkIcon,
  CloseIcon,
  DocumentIcon,
  SearchIcon
} from "../components/Icons"
import EmptyState from "../components/EmptyState"
import ModalListItem from "../components/ModalListItem"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

const GeminiModal = () => {
  const { t, i18n } = useTranslation()
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [favorites, setFavorites] = useState<FavoriteAnswer[]>([])
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [newNoteText, setNewNoteText] = useState("")

  // UI State for Features
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedIds, setCopiedIds] = useState<Record<string, boolean>>({})

  // Reset states when modal changes
  useEffect(() => {
    setSearchQuery("")
    setCopiedIds({})
  }, [activeModal])

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

    // 3. Favoriler, Prompts ve Notları storage'dan yükle
    const loadData = () => {
      chrome.storage.local.get(
        ["gemini_favorites", "gemini_prompts", "gemini_notes"],
        (result) => {
          setFavorites(result.gemini_favorites || [])
          setPrompts(result.gemini_prompts || [])
          setNotes(result.gemini_notes || [])
        }
      )
    }
    loadData()

    // 4. Güncellemeleri dinle (gemini-favorites ve gemini-prompts'ten yayınlanır)
    const handleDataUpdated = () => loadData()
    window.addEventListener("FAVORITES_UPDATED", handleDataUpdated)
    window.addEventListener("PROMPTS_UPDATED", handleDataUpdated)

    // Language handling
    chrome.storage.sync.get("gbr_settings_language", (res) => {
      if (res.gbr_settings_language) i18n.changeLanguage(res.gbr_settings_language)
    })
    const langListener = (changes: any, ns: string) => {
      if (ns === "sync" && changes.gbr_settings_language) {
        i18n.changeLanguage(changes.gbr_settings_language.newValue)
      }
    }
    chrome.storage.onChanged.addListener(langListener)

    return () => {
      observer.disconnect()
      window.removeEventListener("OPEN_GEMINI_MODAL", handleOpenModal)
      window.removeEventListener("FAVORITES_UPDATED", handleDataUpdated)
      window.removeEventListener("PROMPTS_UPDATED", handleDataUpdated)
      chrome.storage.onChanged.removeListener(langListener)
    }
  }, [i18n])

  // Favoriyi modalden sil
  const deleteFavorite = (id: string) => {
    chrome.storage.local.get("gemini_favorites", (result) => {
      const updated = (result.gemini_favorites || []).filter(
        (f: FavoriteAnswer) => f.id !== id
      )
      chrome.storage.local.set({ gemini_favorites: updated }, () => {
        setFavorites(updated)
        window.dispatchEvent(new CustomEvent("FAVORITES_UPDATED"))
      })
    })
  }

  // İstemi modalden sil
  const deletePrompt = (id: string) => {
    chrome.storage.local.get("gemini_prompts", (result) => {
      const updated = (result.gemini_prompts || []).filter(
        (p: SavedPrompt) => p.id !== id
      )
      chrome.storage.local.set({ gemini_prompts: updated }, () => {
        setPrompts(updated)
        window.dispatchEvent(new CustomEvent("PROMPTS_UPDATED"))
      })
    })
  }

  // Not Ekleme ve Silme
  const saveNote = () => {
    if (!newNoteText.trim()) return
    const newNote: Note = {
      id: "note_" + Date.now().toString() + Math.random().toString(36).substr(2, 5),
      text: newNoteText,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    const updated = [newNote, ...notes]
    chrome.storage.local.set({ gemini_notes: updated }, () => {
      setNotes(updated)
      setNewNoteText("")
    })
  }

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id)
    chrome.storage.local.set({ gemini_notes: updated }, () => {
      setNotes(updated)
    })
  }

  // Panoya kopyalama aracı
  const copyToClipboard = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIds((prev) => ({ ...prev, [id]: true }))
      setTimeout(() => {
        setCopiedIds((prev) => ({ ...prev, [id]: false }))
      }, 2000)
    } catch (err) {
      console.error("Kopyalama hatası:", err)
    }
  }

  if (!activeModal) return null

  const modalTitles = {
    favorites: t("favoriteAnswers"),
    prompts: t("promptLibrary"),
    notes: t("myNotes"),
  }

  // Filtrelenmiş veri
  const filteredFavorites = favorites.filter((f) =>
    f.text.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredPrompts = prompts.filter((p) =>
    p.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredNotes = notes.filter((n) =>
    n.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

        {(activeModal === "favorites" || activeModal === "prompts" || activeModal === "notes") && (
          <div className="modal-search-container">
            <span className="modal-search-icon">
              <SearchIcon size={20} />
            </span>
            <input
              type="text"
              className="modal-search-input"
              placeholder={t("searchIn", { title: modalTitles[activeModal as keyof typeof modalTitles] })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <div className="modal-content">
          {(activeModal === "favorites" || activeModal === "prompts") && (
            <h3 className="list-header">{t("latest")}</h3>
          )}

          {activeModal === "favorites" ? (
            favorites.length === 0 ? (
              <EmptyState 
                icon={<StarIcon size={40} />} 
                title={t("noFavorites")} 
                description={t("noFavoritesDesc")} 
              />
            ) : filteredFavorites.length === 0 ? (
              <div className="favorites-empty">
                <p className="modal-desc">{t("noFavoritesMatch")}</p>
              </div>
            ) : (
              <ul className="item-list">
                {filteredFavorites.map((fav) => (
                  <ModalListItem
                    key={fav.id}
                    id={fav.id}
                    text={fav.text}
                    timestamp={fav.savedAt}
                    url={fav.url}
                    icon={<StarIcon size={24} />}
                    iconColorClass="star"
                    onCopy={copyToClipboard}
                    onDelete={deleteFavorite}
                    isCopied={!!copiedIds[fav.id]}
                  />
                ))}
              </ul>
            )
          ) : activeModal === "prompts" ? (
            prompts.length === 0 ? (
              <EmptyState 
                icon={<BookmarkIcon size={40} />} 
                title={t("noPrompts")} 
                description={t("noPromptsDesc")} 
              />
            ) : filteredPrompts.length === 0 ? (
              <div className="favorites-empty">
                <p className="modal-desc">{t("noPromptsMatch")}</p>
              </div>
            ) : (
              <ul className="item-list">
                {filteredPrompts.map((p) => (
                  <ModalListItem
                    key={p.id}
                    id={p.id}
                    text={p.text}
                    timestamp={p.savedAt}
                    url={p.url}
                    icon={<BookmarkIcon size={24} />}
                    iconColorClass="bookmark"
                    onCopy={copyToClipboard}
                    onDelete={deletePrompt}
                    isCopied={!!copiedIds[p.id]}
                  />
                ))}
              </ul>
            )
          ) : activeModal === "notes" ? (
            <div className="notes-container">
              <div className="note-input-area" style={{ margin: "0 24px 0 24px" }}>
                <textarea
                  className="note-textarea"
                  placeholder={t("writeNewNote")}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    backgroundColor: "var(--gem-sys-color--surface-container-high, #282a2c)",
                    color: "var(--gem-sys-color--on-surface, #e3e3e3)",
                    border: "1px solid var(--gem-sys-color--outline-variant, #444746)",
                    borderRadius: "12px",
                    padding: "12px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                    marginBottom: "8px",
                    boxSizing: "border-box"
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={saveNote}
                    disabled={!newNoteText.trim()}
                    style={{
                      backgroundColor: "var(--gem-sys-color--primary, #a8c7fa)",
                      color: "var(--gem-sys-color--on-primary, #000)",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: newNoteText.trim() ? "pointer" : "not-allowed",
                      opacity: newNoteText.trim() ? 1 : 0.5
                    }}>
                    {t("saveNote")}
                  </button>
                </div>
              </div>

              {notes.length === 0 ? (
                <EmptyState 
                  icon={<DocumentIcon size={40} />} 
                  title={t("noNotes")} 
                />
              ) : filteredNotes.length === 0 ? (
                <div className="favorites-empty">
                  <p className="modal-desc">{t("noNotesMatch")}</p>
                </div>
              ) : (
                <ul className="item-list">
                  {filteredNotes.map((n) => (
                    <ModalListItem
                      key={n.id}
                      id={n.id}
                      text={n.text}
                      timestamp={n.createdAt}
                      icon={<DocumentIcon size={24} />}
                      iconColorClass="document"
                      onCopy={copyToClipboard}
                      onDelete={deleteNote}
                      isCopied={!!copiedIds[n.id]}
                      dateFormat={{
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }}
                    />
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
export default GeminiModal
