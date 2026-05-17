import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"

import "./i18n"
import "./popup.css"

import { COPY_FEEDBACK_TIMEOUT_MS, STORAGE_KEYS } from "./constants"
import ConfirmModal from "./components/ConfirmModal"
import AlertModal from "./components/AlertModal"
import StatBox from "./components/StatBox"
import SearchResultItem from "./components/SearchResultItem"
import { BookmarkIcon, StarIcon, DocumentIcon, FolderIcon } from "./components/Icons"

import type { FavoriteAnswer } from "./types/favorite"
import type { ChatFolder } from "./types/folder"
import type { Note } from "./types/note"
import type { SavedPrompt } from "./types/prompt"
import type { LocalStorageData, SyncStorageData } from "./types/storage"

function IndexPopup() {
  const { t, i18n } = useTranslation()
  const [currentLang, setCurrentLang] = useState<string>("tr")
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])
  const [favorites, setFavorites] = useState<FavoriteAnswer[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<ChatFolder[]>([])
  const [bulkDeleteEnabled, setBulkDeleteEnabled] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Custom modals state
  const [alertMessage, setAlertMessage] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    // Load data from chrome.storage
    chrome.storage.local.get(
      [
        STORAGE_KEYS.LOCAL.PROMPTS,
        STORAGE_KEYS.LOCAL.FAVORITES,
        STORAGE_KEYS.LOCAL.NOTES,
        STORAGE_KEYS.LOCAL.FOLDERS
      ],
      (localRes) => {
        const localResult = localRes as LocalStorageData
        chrome.storage.sync.get(
          [STORAGE_KEYS.SYNC.BULK_DELETE, STORAGE_KEYS.SYNC.LANGUAGE],
          (syncRes) => {
            const syncResult = syncRes as SyncStorageData
            setPrompts(localResult.gemini_prompts || [])
            setFavorites(localResult.gemini_favorites || [])
            setNotes(localResult.gemini_notes || [])
            setFolders(localResult.gemini_folders || [])
            if (syncResult.gbr_settings_bulk_delete !== undefined) {
              setBulkDeleteEnabled(syncResult.gbr_settings_bulk_delete)
            }

            // Language handling
            let savedLang = syncResult.gbr_settings_language
            if (!savedLang) {
              const sysLang = typeof chrome !== "undefined" && chrome.i18n ? chrome.i18n.getUILanguage() : navigator.language
              savedLang = sysLang.startsWith("tr") ? "tr" : "en"
            }
            setCurrentLang(savedLang)
            i18n.changeLanguage(savedLang)
          }
        )
      }
    )
  }, [i18n])

  const handleExport = () => {
    chrome.storage.local.get(
      [
        STORAGE_KEYS.LOCAL.PROMPTS,
        STORAGE_KEYS.LOCAL.FAVORITES,
        STORAGE_KEYS.LOCAL.NOTES,
        STORAGE_KEYS.LOCAL.FOLDERS
      ],
      (res) => {
        const result = res as LocalStorageData
        const exportData = {
          prompts: result.gemini_prompts || [],
          favorites: result.gemini_favorites || [],
          notes: result.gemini_notes || [],
          folders: result.gemini_folders || []
        }
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json"
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `enhancer_for_gemini_backup_${new Date().toISOString().split("T")[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    )
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string)
        
        // Basic format validation
        if (typeof jsonData !== 'object' || Array.isArray(jsonData)) {
          setAlertMessage(t("importFormatError"))
          return
        }

        const newPrompts = Array.isArray(jsonData.prompts) ? jsonData.prompts : []
        const newFavorites = Array.isArray(jsonData.favorites) ? jsonData.favorites : []
        const newNotes = Array.isArray(jsonData.notes) ? jsonData.notes : []
        const newFolders = Array.isArray(jsonData.folders) ? jsonData.folders : []

        chrome.storage.local.set({
          [STORAGE_KEYS.LOCAL.PROMPTS]: newPrompts,
          [STORAGE_KEYS.LOCAL.FAVORITES]: newFavorites,
          [STORAGE_KEYS.LOCAL.NOTES]: newNotes,
          [STORAGE_KEYS.LOCAL.FOLDERS]: newFolders
        }, () => {
          setAlertMessage(t("importSuccess"))
          setPrompts(newPrompts)
          setFavorites(newFavorites)
          setNotes(newNotes)
          setFolders(newFolders)
        })
      } catch (error) {
        setAlertMessage(t("importReadError"))
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const toggleBulkDelete = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked
    setBulkDeleteEnabled(val)
    chrome.storage.sync.set({ [STORAGE_KEYS.SYNC.BULK_DELETE]: val })
  }

  const handleClearAllClick = () => {
    setShowConfirm(true)
  }

  const executeClearAll = () => {
    setShowConfirm(false)
    chrome.storage.local.remove(
      [
        STORAGE_KEYS.LOCAL.PROMPTS,
        STORAGE_KEYS.LOCAL.FAVORITES,
        STORAGE_KEYS.LOCAL.NOTES,
        STORAGE_KEYS.LOCAL.FOLDERS
      ],
      () => {
        setPrompts([])
        setFavorites([])
        setNotes([])
        setFolders([])
        setAlertMessage(t("clearedSuccess"))
      }
    )
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), COPY_FEEDBACK_TIMEOUT_MS)
    })
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value
    setCurrentLang(lang)
    i18n.changeLanguage(lang)
    chrome.storage.sync.set({ [STORAGE_KEYS.SYNC.LANGUAGE]: lang })
  }

  const filteredPrompts = prompts.filter((p) => p.text?.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredFavorites = favorites.filter((f) => f.text?.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredNotes = notes.filter((n) => n.text?.toLowerCase().includes(searchQuery.toLowerCase()))
  const isSearching = searchQuery.trim().length > 0

  return (
    <>
      <div className="popup-container">
        
        {/* Header */}
        <div className="popup-header">
          <h2 className="popup-title">
            <span className="popup-title-emoji">🚀</span> {t("appTitle")}
          </h2>
          <div className="popup-header-actions">
            <select
              value={currentLang}
              onChange={handleLanguageChange}
              className="popup-lang-select">
              <option value="en">EN</option>
              <option value="tr">TR</option>
            </select>
            <span className="popup-version-badge">v1.0</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="popup-search-wrapper">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="popup-search-input"
          />
        </div>

        {/* Search Mode — Results */}
        {isSearching ? (
          <div className="popup-search-results">
            
            {/* Prompt results */}
            {filteredPrompts.length > 0 && (
              <div className="popup-search-group">
                <h4 className="popup-search-group-title">{t("prompts")} ({filteredPrompts.length})</h4>
                {filteredPrompts.map((p) => (
                  <SearchResultItem
                    key={p.id}
                    text={p.text}
                    onCopy={() => handleCopy(p.id, p.text)}
                    isCopied={copiedId === p.id}
                    copyText={t("copy")}
                    copiedText={t("copied")}
                  />
                ))}
              </div>
            )}

            {/* Favorite results */}
            {filteredFavorites.length > 0 && (
              <div className="popup-search-group">
                <h4 className="popup-search-group-title">{t("favorites")} ({filteredFavorites.length})</h4>
                {filteredFavorites.map((f) => (
                  <SearchResultItem
                    key={f.id}
                    text={f.text}
                    onCopy={() => handleCopy(f.id, f.text)}
                    isCopied={copiedId === f.id}
                    copyText={t("copy")}
                    copiedText={t("copied")}
                  />
                ))}
              </div>
            )}

            {/* Note results */}
            {filteredNotes.length > 0 && (
              <div className="popup-search-group">
                <h4 className="popup-search-group-title">{t("notes")} ({filteredNotes.length})</h4>
                {filteredNotes.map((n) => (
                  <SearchResultItem
                    key={n.id}
                    text={n.text}
                    onCopy={() => handleCopy(n.id, n.text)}
                    isCopied={copiedId === n.id}
                    copyText={t("copy")}
                    copiedText={t("copied")}
                  />
                ))}
              </div>
            )}

            {filteredPrompts.length === 0 && filteredFavorites.length === 0 && filteredNotes.length === 0 && (
              <div className="popup-no-results">
                {t("noResults")}
              </div>
            )}
          </div>
        ) : (
          /* Normal Mode — Main Screen */
          <>
            {/* Stats */}
            <div className="popup-stats-grid">
              <StatBox icon={<BookmarkIcon size={24} />} value={prompts.length} label={t("prompts")} />
              <StatBox icon={<StarIcon size={24} />} value={favorites.length} label={t("favorites")} />
              <StatBox icon={<DocumentIcon size={24} />} value={notes.length} label={t("notes")} />
              <StatBox icon={<FolderIcon size={24} />} value={folders.length} label={t("chatFolders")} />
            </div>

            {/* Data Management */}
            <div className="popup-section">
              <h3 className="popup-section-title">{t("dataManagement")}</h3>
              
              <div className="popup-data-section">
                <div className="popup-data-header">
                  <span className="popup-data-label">{t("allData")}</span>
                </div>
                <div className="popup-data-desc">
                  {t("allDataDesc")}
                </div>
                <div className="popup-data-actions">
                  <button className="popup-btn-primary" onClick={handleExport}>
                    {t("export")}
                  </button>
                  <label className="popup-btn-secondary">
                    {t("import")}
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={handleImport}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="popup-section">
              <h3 className="popup-section-title">{t("settings")}</h3>
              <label className="popup-setting-label">
                <span>{t("bulkDeleteShow")}</span>
                <input
                  type="checkbox"
                  checked={bulkDeleteEnabled}
                  onChange={toggleBulkDelete}
                  className="popup-setting-checkbox"
                />
              </label>
            </div>

            {/* Danger Zone */}
            <div className="popup-danger-zone">
              <button onClick={handleClearAllClick} className="popup-danger-btn">
                {t("clearAllData")}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmModal
          title={t("clearDataTitle")}
          description={t("clearDataDesc")}
          onConfirm={executeClearAll}
          onCancel={() => setShowConfirm(false)}
          confirmText={t("yesDelete")}
          cancelText={t("cancel")}
        />
      )}

      {/* Alert Modal */}
      {alertMessage && (
        <AlertModal
          title={t("info")}
          message={alertMessage}
          onClose={() => setAlertMessage("")}
          closeText={t("ok")}
        />
      )}
    </>
  )
}

export default IndexPopup
