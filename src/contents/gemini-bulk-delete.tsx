// contents/gemini-bulk-delete.tsx
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import "../i18n"

import { DELETE_WAIT_MS, STORAGE_KEYS } from "../constants"
import { generateId } from "../utils/id"
import { initLanguageSync } from "../utils/language"
import AlertModal from "../components/modal/AlertModal"
import ConfirmModal from "../components/modal/ConfirmModal"
import FoldersModal from "../components/modal/FoldersModal"
import type { ChatFolder, FolderChatItem } from "../types/folder"
import type { LocalStorageData, SyncStorageData } from "../types/storage"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  const container =
    document.querySelector('conversations-list[data-test-id="all-conversations"]') ||
    document.querySelector('conversations-list')
  return container ? { element: container, insertPosition: "beforebegin" } : null
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const GeminiBulkDelete = () => {
  const [enabled, setEnabled] = useState(true)
  const [mode, setMode] = useState<"idle" | "selecting" | "deleting">("idle")
  const [selectedHrefs, setSelectedHrefs] = useState<Set<string>>(new Set())
  const [showConfirm, setShowConfirm] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [folders, setFolders] = useState<ChatFolder[]>([])
  const [newFolderName, setNewFolderName] = useState("")
  const [alertMessage, setAlertMessage] = useState("")

  const { t, i18n } = useTranslation()

  useEffect(() => {
    // Load initial settings
    chrome.storage.sync.get(
      [STORAGE_KEYS.SYNC.BULK_DELETE, STORAGE_KEYS.SYNC.LANGUAGE],
      (res) => {
        const result = res as SyncStorageData
        if (result.gbr_settings_bulk_delete !== undefined) {
          setEnabled(result.gbr_settings_bulk_delete)
        }
        if (result.gbr_settings_language) {
          i18n.changeLanguage(result.gbr_settings_language)
        }
      }
    )

    // Load folders
    chrome.storage.local.get(STORAGE_KEYS.LOCAL.FOLDERS, (res) => {
      const result = res as LocalStorageData
      setFolders(result.gemini_folders || [])
    })

    // Listen for folder updates from the modal
    const handleFoldersUpdated = () => {
      chrome.storage.local.get(STORAGE_KEYS.LOCAL.FOLDERS, (res) => {
        const result = res as LocalStorageData
        setFolders(result.gemini_folders || [])
      })
    }
    window.addEventListener("FOLDERS_UPDATED", handleFoldersUpdated)

    // Listen for settings changes
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      namespace: string
    ) => {
      if (namespace === "sync") {
        if (changes[STORAGE_KEYS.SYNC.BULK_DELETE])
          setEnabled(changes[STORAGE_KEYS.SYNC.BULK_DELETE].newValue as boolean)
        if (changes[STORAGE_KEYS.SYNC.LANGUAGE])
          i18n.changeLanguage(changes[STORAGE_KEYS.SYNC.LANGUAGE].newValue as string)
      }
    }
    chrome.storage.onChanged.addListener(listener)

    return () => {
      chrome.storage.onChanged.removeListener(listener)
      window.removeEventListener("FOLDERS_UPDATED", handleFoldersUpdated)
    }
  }, [i18n])


  // Handle global clicks during "selecting" mode
  useEffect(() => {
    if (mode !== "selecting") return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const listItem = target.closest('gem-nav-list-item[data-test-id="conversation"]')
      const anchor = listItem?.querySelector('a')

      if (anchor) {
        e.preventDefault()
        e.stopPropagation()
        const href = anchor.getAttribute("href")
        if (href) {
          setSelectedHrefs((prev) => {
            const next = new Set(prev)
            if (next.has(href)) {
              next.delete(href)
            } else {
              next.add(href)
            }
            return next
          })
        }
      }
    }

    // Capturing listener to intercept navigation
    document.addEventListener("click", handleClick, true)
    document.body.classList.add("gemini-bulk-select-mode")

    return () => {
      document.removeEventListener("click", handleClick, true)
      document.body.classList.remove("gemini-bulk-select-mode")
    }
  }, [mode])

  const handleStartSelect = () => {
    setMode("selecting")
    setSelectedHrefs(new Set())
  }

  const handleCancelSelect = () => {
    setMode("idle")
    setSelectedHrefs(new Set())
  }

  /** Extract chat data from currently selected DOM anchors */
  const getSelectedChatsData = (): FolderChatItem[] => {
    const chats: FolderChatItem[] = []
    for (const href of selectedHrefs) {
      const anchor = document.querySelector(`gem-nav-list-item[data-test-id="conversation"] a[href="${href}"]`) || document.querySelector(`a[href="${href}"]`)
      let title = "Unknown Chat"
      if (anchor) {
        title = anchor.textContent?.trim() || "Unknown Chat"
        // Strip "Options" / "Seçenekler" labels appended by Gemini's UI
        title = title
          .replace(/Options/i, "")
          .replace(/Seçenekler/i, "")
          .trim()
      }
      chats.push({
        id: href,
        title,
        url: href.startsWith("http")
          ? href
          : `https://gemini.google.com${href}`,
        addedAt: Date.now()
      })
    }
    return chats
  }

  const handleAddToFolderClick = () => {
    if (selectedHrefs.size === 0) {
      setAlertMessage(t("selectChatsToDelete"))
      return
    }
    setShowFolderModal(true)
  }

  const addChatsToFolder = (folderId: string) => {
    const chatsToAdd = getSelectedChatsData()
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        const existingIds = new Set(f.chats.map((c: FolderChatItem) => c.id))
        const newChats = chatsToAdd.filter((c) => !existingIds.has(c.id))
        return { ...f, chats: [...newChats, ...f.chats] }
      }
      return f
    })

    chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.FOLDERS]: updatedFolders }, () => {
      setFolders(updatedFolders)
      window.dispatchEvent(new CustomEvent("FOLDERS_UPDATED"))
      setShowFolderModal(false)
      setMode("idle")
      setSelectedHrefs(new Set())
      setAlertMessage(t("chatsAddedToFolder"))
    })
  }

  const handleCreateAndAdd = () => {
    if (!newFolderName.trim()) return
    const newFolder: ChatFolder = {
      id: generateId("folder"),
      name: newFolderName.trim(),
      createdAt: Date.now(),
      chats: getSelectedChatsData()
    }

    const updatedFolders = [newFolder, ...folders]
    chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.FOLDERS]: updatedFolders }, () => {
      setFolders(updatedFolders)
      setNewFolderName("")
      window.dispatchEvent(new CustomEvent("FOLDERS_UPDATED"))
      setShowFolderModal(false)
      setMode("idle")
      setSelectedHrefs(new Set())
      setAlertMessage(t("chatsAddedToFolder"))
    })
  }

  const handleDeleteClick = () => {
    if (selectedHrefs.size === 0) {
      setAlertMessage(t("selectChatsToDelete"))
      return
    }
    setShowConfirm(true)
  }

  const executeDelete = async () => {
    setMode("deleting")
    setShowConfirm(false)

    let resultMessage = ""

    try {
      for (const href of selectedHrefs) {
        const anchor = document.querySelector(`gem-nav-list-item[data-test-id="conversation"] a[href="${href}"]`) || document.querySelector(`a[href="${href}"]`)
        if (!anchor) {
          console.warn(`Chat not found or not visible in DOM: ${href}`)
          continue
        }

        // Find the options/actions button next to the conversation link
        const listItem = anchor.closest('gem-nav-list-item[data-test-id="conversation"]')
        const actionsBtn = listItem?.querySelector(
          'button[data-test-id="actions-menu-button"]'
        ) as HTMLElement

        if (!actionsBtn) {
          console.warn(`Options button not found for: ${href}`)
          continue
        }

        actionsBtn.click()
        await wait(DELETE_WAIT_MS.MENU_OPEN)

        // Find the "Delete" menu item in the opened context menu
        const menuItems = Array.from(
          document.querySelectorAll('.mat-mdc-menu-panel [role="menuitem"]')
        ) as HTMLElement[]

        const deleteMenuItem = menuItems.find((el) => {
          const testId = el.getAttribute("data-test-id")
          if (testId && testId.toLowerCase().includes("delete")) return true

          const icon = el.querySelector("mat-icon, .mat-icon, .google-symbols")
          return !!(icon && icon.textContent?.toLowerCase().trim() === "delete")
        })

        if (!deleteMenuItem) {
          console.error("Delete menu item not found in context menu.")
          document.body.click()
          continue
        }

        deleteMenuItem.click()
        await wait(DELETE_WAIT_MS.CONFIRM_DIALOG)

        // Click the confirm button in the confirmation dialog
        const dialogButtons = Array.from(
          document.querySelectorAll(
            "mat-dialog-container button, .mdc-dialog button"
          )
        ) as HTMLElement[]

        const confirmBtn = dialogButtons.find(
          (el) => el.getAttribute("data-test-id") === "confirm-button"
        )

        if (confirmBtn) {
          confirmBtn.click()
          await wait(DELETE_WAIT_MS.POST_DELETE)
        } else {
          console.error("Confirm button not found in delete dialog.")
          document.body.click()
        }
      }
      resultMessage = t("chatsDeletedSuccess")
    } catch (err) {
      console.error("Error during bulk delete operation:", err)
      resultMessage = t("deleteError")
    } finally {
      setMode("idle")
      setSelectedHrefs(new Set())
      setAlertMessage(resultMessage)
    }
  }

  // Manage global CSS for selection visual state
  useEffect(() => {
    let styleEl = document.getElementById(
      "gemini-bulk-select-style"
    ) as HTMLStyleElement
    if (!styleEl) {
      styleEl = document.createElement("style")
      styleEl.id = "gemini-bulk-select-style"
      document.head.appendChild(styleEl)
    }

    if (mode === "idle") {
      styleEl.textContent = ""
      return
    }

    const cssRules = [
      `body.gemini-bulk-select-mode gem-nav-list-item[data-test-id="conversation"] a {
         cursor: pointer !important;
         border: 2px dashed rgba(26, 115, 232, 0.4) !important;
         border-radius: 8px;
         margin-top: 2px;
         margin-bottom: 2px;
         transition: all 0.2s ease;
      }`,
      `body.gemini-bulk-select-mode gem-nav-list-item[data-test-id="conversation"] a:hover {
         background-color: rgba(26, 115, 232, 0.1) !important;
         border-style: solid !important;
      }`
    ]

    Array.from(selectedHrefs).forEach((href) => {
      cssRules.push(
        `body.gemini-bulk-select-mode gem-nav-list-item[data-test-id="conversation"] a[href="${href}"] { 
           background-color: rgba(26, 115, 232, 0.15) !important; 
           border: 2px solid #1a73e8 !important; 
        }`
      )
    })

    styleEl.textContent = cssRules.join("\n")
  }, [mode, selectedHrefs])

  if (!enabled) return null

  if (mode === "idle") {
    return (
      <div className="gbr-bulk-delete-header-container">
        <button
          onClick={handleStartSelect}
          className="bulk-delete-btn"
          title={t("bulkSelect")}>
          <span className="google-symbols" style={{ fontSize: "18px" }}>
            checklist
          </span>
          <span>{t("bulkSelect")}</span>
        </button>

        {/* Alert modal — shown after delete completes */}
        {alertMessage && (
          <AlertModal
            title={t("info")}
            message={alertMessage}
            onClose={() => setAlertMessage("")}
            closeText={t("ok")}
          />
        )}
      </div>
    )
  }

  return (
    <div className="gbr-bulk-delete-header-container">
      <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
        <button
          onClick={handleCancelSelect}
          disabled={mode === "deleting"}
          className="bulk-delete-btn cancel"
          style={{ marginLeft: 0 }}>
          <span>{t("cancel")}</span>
        </button>
        <button
          onClick={handleAddToFolderClick}
          disabled={mode === "deleting" || selectedHrefs.size === 0}
          className={`bulk-delete-btn ${mode === "deleting" ? "deleting" : ""}`}
          style={{ marginLeft: 0 }}
          title={t("addToFolder")}>
          <span className="google-symbols" style={{ fontSize: "18px" }}>
            folder
          </span>
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={mode === "deleting" || selectedHrefs.size === 0}
          className={`bulk-delete-btn delete-action ${mode === "deleting" ? "deleting" : ""}`}
          style={{ marginLeft: 0 }}
          title={t("deleteChatsTitle")}>
          <span className="google-symbols" style={{ fontSize: "18px" }}>
            delete
          </span>
          <span>
            {mode === "deleting"
              ? t("deleting")
              : t("deleteCount", { count: selectedHrefs.size })}
          </span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmModal
          title={t("deleteChatsTitle")}
          description={t("deleteChatsDesc", { count: selectedHrefs.size })}
          onConfirm={executeDelete}
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

      {/* Folder Select Modal */}
      {showFolderModal && (
        <FoldersModal
          mode="select"
          folders={folders}
          newFolderName={newFolderName}
          onNewFolderNameChange={setNewFolderName}
          onCreateFolder={handleCreateAndAdd}
          onSelectFolder={addChatsToFolder}
          onClose={() => setShowFolderModal(false)}
        />
      )}
    </div>
  )
}

export default GeminiBulkDelete
