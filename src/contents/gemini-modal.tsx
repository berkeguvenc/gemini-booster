/*
 * Copyright (C) 2026 Yağız Berke Güvenç
 *
 * This file is part of gemini-booster.
 *
 * gemini-booster is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * gemini-booster is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with gemini-booster. If not, see <https://www.gnu.org/licenses/>.
 */

// contents/gemini-modal.tsx
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import "../i18n"

import { generateId } from "../utils/id"
import { initLanguageSync } from "../utils/language"
import { getFolders, saveFolders } from "../utils/storage"
import { useCopyToClipboard } from "../hooks/useCopyToClipboard"

import type { FavoriteAnswer } from "../types/favorite"
import type { ChatFolder } from "../types/folder"
import type { Note } from "../types/note"
import type { SavedPrompt } from "../types/prompt"
import type { LocalStorageData } from "../types/storage"
import { STORAGE_KEYS } from "../constants"

import {
  StarIcon,
  BookmarkIcon,
  CloseIcon,
  DocumentIcon,
  SearchIcon,
  FolderIcon
} from "../components/Icons"

import FavoritesModal from "../components/modal/FavoritesModal"
import PromptsModal from "../components/modal/PromptsModal"
import NotesModal from "../components/modal/NotesModal"
import FoldersModal from "../components/modal/FoldersModal"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

const MODAL_TABS = ["favorites", "prompts", "notes", "folders"] as const
type ModalTab = (typeof MODAL_TABS)[number]

const GeminiModal = () => {
  const { t, i18n } = useTranslation()
  const [activeModal, setActiveModal] = useState<ModalTab | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [favorites, setFavorites] = useState<FavoriteAnswer[]>([])
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<ChatFolder[]>([])
  const [newNoteText, setNewNoteText] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null)

  // Search and copy UI state
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedIds, copyToClipboard] = useCopyToClipboard()

  // Reset search when the active modal changes
  useEffect(() => {
    setSearchQuery("")
  }, [activeModal])

  useEffect(() => {
    // Theme observer
    const checkTheme = () =>
      setIsDark(document.body.classList.contains("dark-theme"))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    })

    // Listen for "open modal" signal from the sidebar
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent
      setActiveModal(customEvent.detail)
    }
    window.addEventListener("OPEN_GEMINI_MODAL", handleOpenModal)

    // Load data from storage
    const loadData = () => {
      chrome.storage.local.get(
        [
          STORAGE_KEYS.LOCAL.FAVORITES,
          STORAGE_KEYS.LOCAL.PROMPTS,
          STORAGE_KEYS.LOCAL.NOTES,
          STORAGE_KEYS.LOCAL.FOLDERS
        ],
        (res) => {
          const result = res as LocalStorageData
          setFavorites(result.gemini_favorites || [])
          setPrompts(result.gemini_prompts || [])
          setNotes(result.gemini_notes || [])
          setFolders(result.gemini_folders || [])
        }
      )
    }
    loadData()

    // Listen for data updates dispatched by other content scripts
    const handleDataUpdated = () => loadData()
    window.addEventListener("FAVORITES_UPDATED", handleDataUpdated)
    window.addEventListener("PROMPTS_UPDATED", handleDataUpdated)
    window.addEventListener("FOLDERS_UPDATED", handleDataUpdated)

    // Language sync
    const cleanupLang = initLanguageSync(i18n)

    return () => {
      observer.disconnect()
      window.removeEventListener("OPEN_GEMINI_MODAL", handleOpenModal)
      window.removeEventListener("FAVORITES_UPDATED", handleDataUpdated)
      window.removeEventListener("PROMPTS_UPDATED", handleDataUpdated)
      window.removeEventListener("FOLDERS_UPDATED", handleDataUpdated)
      cleanupLang()
    }
  }, [i18n])

  // Delete a favorite from storage and update state
  const deleteFavorite = (id: string) => {
    chrome.storage.local.get(STORAGE_KEYS.LOCAL.FAVORITES, (res) => {
      const result = res as LocalStorageData
      const updated = (result.gemini_favorites || []).filter(
        (f: FavoriteAnswer) => f.id !== id
      )
      chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.FAVORITES]: updated }, () => {
        setFavorites(updated)
        window.dispatchEvent(new CustomEvent("FAVORITES_UPDATED"))
      })
    })
  }

  // Delete a prompt from storage and update state
  const deletePrompt = (id: string) => {
    chrome.storage.local.get(STORAGE_KEYS.LOCAL.PROMPTS, (res) => {
      const result = res as LocalStorageData
      const updated = (result.gemini_prompts || []).filter(
        (p: SavedPrompt) => p.id !== id
      )
      chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.PROMPTS]: updated }, () => {
        setPrompts(updated)
        window.dispatchEvent(new CustomEvent("PROMPTS_UPDATED"))
      })
    })
  }

  // Save a new note
  const saveNote = () => {
    if (!newNoteText.trim()) return
    const newNote: Note = {
      id: generateId("note"),
      text: newNoteText,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    const updated = [newNote, ...notes]
    chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.NOTES]: updated }, () => {
      setNotes(updated)
      setNewNoteText("")
    })
  }

  // Delete a note
  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id)
    chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.NOTES]: updated }, () => {
      setNotes(updated)
    })
  }

  // Create a new folder
  const createFolder = () => {
    if (!newFolderName.trim()) return
    const newFolder: ChatFolder = {
      id: generateId("folder"),
      name: newFolderName.trim(),
      createdAt: Date.now(),
      chats: []
    }
    const updated = [newFolder, ...folders]
    chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.FOLDERS]: updated }, () => {
      setFolders(updated)
      setNewFolderName("")
      window.dispatchEvent(new CustomEvent("FOLDERS_UPDATED"))
    })
  }

  // Delete a folder
  const deleteFolder = (id: string) => {
    const updated = folders.filter((f) => f.id !== id)
    chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.FOLDERS]: updated }, () => {
      setFolders(updated)
      if (expandedFolderId === id) setExpandedFolderId(null)
      window.dispatchEvent(new CustomEvent("FOLDERS_UPDATED"))
    })
  }

  // Remove a single chat from a folder
  const removeChatFromFolder = (folderId: string, chatId: string) => {
    const updated = folders.map((f) => {
      if (f.id === folderId) {
        return { ...f, chats: f.chats.filter((c) => c.id !== chatId) }
      }
      return f
    })
    chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.FOLDERS]: updated }, () => {
      setFolders(updated)
      window.dispatchEvent(new CustomEvent("FOLDERS_UPDATED"))
    })
  }

  if (!activeModal) return null

  const modalTitles: Record<ModalTab, string> = {
    favorites: t("favoriteAnswers"),
    prompts: t("promptLibrary"),
    notes: t("myNotes"),
    folders: t("chatFolders")
  }

  const modalIcons: Record<ModalTab, React.ReactNode> = {
    favorites: <StarIcon size={32} />,
    prompts: <BookmarkIcon size={32} />,
    notes: <DocumentIcon size={32} />,
    folders: <FolderIcon size={32} />
  }

  // Filtered data for search
  const filteredFavorites = favorites.filter((f) =>
    f.text.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredPrompts = prompts.filter((p) =>
    p.text.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredNotes = notes.filter((n) =>
    n.text.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
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
              className="header-icon">
              {modalIcons[activeModal]}
            </span>
            <h2 className="modal-title">
              {modalTitles[activeModal]}
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="modal-close-btn"
            aria-label={t("close")}>
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Search bar — shown for all tabs */}
        <div className="modal-search-container">
          <span className="modal-search-icon">
            <SearchIcon size={20} />
          </span>
          <input
            type="text"
            className="modal-search-input"
            placeholder={t("searchIn", { title: modalTitles[activeModal] })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="modal-content">
          {(activeModal === "favorites" || activeModal === "prompts") && (
            <h3 className="list-header">{t("latest")}</h3>
          )}

          {activeModal === "favorites" ? (
            <FavoritesModal
              favorites={favorites}
              filteredFavorites={filteredFavorites}
              copiedIds={copiedIds}
              onCopy={copyToClipboard}
              onDelete={deleteFavorite}
            />
          ) : activeModal === "prompts" ? (
            <PromptsModal
              prompts={prompts}
              filteredPrompts={filteredPrompts}
              copiedIds={copiedIds}
              onCopy={copyToClipboard}
              onDelete={deletePrompt}
            />
          ) : activeModal === "notes" ? (
            <NotesModal
              notes={notes}
              filteredNotes={filteredNotes}
              newNoteText={newNoteText}
              copiedIds={copiedIds}
              onNewNoteTextChange={setNewNoteText}
              onSaveNote={saveNote}
              onCopy={copyToClipboard}
              onDelete={deleteNote}
            />
          ) : activeModal === "folders" ? (
            <FoldersModal
              folders={folders}
              filteredFolders={filteredFolders}
              newFolderName={newFolderName}
              expandedFolderId={expandedFolderId}
              copiedIds={copiedIds}
              onNewFolderNameChange={setNewFolderName}
              onCreateFolder={createFolder}
              onDeleteFolder={deleteFolder}
              onToggleExpand={(id) =>
                setExpandedFolderId(expandedFolderId === id ? null : id)
              }
              onRemoveChatFromFolder={removeChatFromFolder}
              onCopy={copyToClipboard}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default GeminiModal
