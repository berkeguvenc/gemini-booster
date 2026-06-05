/*
 * Copyright (C) 2026 Yağız Berke Güvenç
 *
 * This file is part of gemini-booster.
 *
 * gemini-booster is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * gemini-booster is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gemini-booster. If not, see <https://www.gnu.org/licenses/>.
 */

// contents/gemini-bulk-delete.tsx
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import "../i18n"

import { DELETE_WAIT_MS, STORAGE_KEYS, DOM_SELECTORS } from "../constants"
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
  const section = document.querySelector('expandable-section[data-test-id="chats-expandable-section"]')
  if (section) {
    ; (section as HTMLElement).style.position = 'relative'
    return { element: section, insertPosition: "afterbegin" }
  }

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
      const listItem = target.closest(DOM_SELECTORS.CHAT_ITEM)
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
      const anchor = document.querySelector(`${DOM_SELECTORS.CHAT_ITEM} a[href="${href}"]`) || document.querySelector(`a[href="${href}"]`)
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
      // CRITICAL FIX: Yield to the event loop so React can process the mode="deleting" state change.
      // This ensures the capturing click listener from "selecting" mode is removed before we trigger programmatic clicks.
      await wait(DELETE_WAIT_MS.YIELD_EVENT_LOOP)

      for (const href of selectedHrefs) {
        const anchor = document.querySelector(`${DOM_SELECTORS.CHAT_ITEM} a[href="${href}"]`) || document.querySelector(`a[href="${href}"]`)
        if (!anchor) {
          console.warn(`Chat not found or not visible in DOM: ${href}`)
          continue
        }

        // Find the options/actions button next to the conversation link
        const listItem = anchor.closest(DOM_SELECTORS.CHAT_ITEM)
        let actionsBtn = listItem?.querySelector(
          DOM_SELECTORS.ACTIONS_BTN
        ) as HTMLElement

        if (!actionsBtn) {
          // Fallback if data-test-id changes
          actionsBtn = listItem?.querySelector(DOM_SELECTORS.ACTIONS_BTN_FALLBACK) as HTMLElement
        }

        if (!actionsBtn) {
          console.warn(`Options button not found for: ${href}`)
          continue
        }

        // CRITICAL FIX: Wait for any leftover menus or dialogs from previous deletions to disappear
        let cleanupWait = 0
        while (
          (document.querySelector(DOM_SELECTORS.DIALOG_CONTAINER) || document.querySelector(DOM_SELECTORS.MENU_PANEL)) &&
          cleanupWait < DELETE_WAIT_MS.CLEANUP_MAX
        ) {
          await wait(DELETE_WAIT_MS.POLL_INTERVAL)
          cleanupWait += DELETE_WAIT_MS.POLL_INTERVAL
        }

        actionsBtn.click()
        
        // Wait up to 2 seconds for the menu to open
        let menuItems: HTMLElement[] = []
        let menuWait = 0
        while (menuItems.length === 0 && menuWait < DELETE_WAIT_MS.MENU_OPEN_MAX) {
          await wait(DELETE_WAIT_MS.POLL_INTERVAL)
          menuWait += DELETE_WAIT_MS.POLL_INTERVAL
          menuItems = Array.from(
            document.querySelectorAll(DOM_SELECTORS.MENU_ITEM)
          ) as HTMLElement[]
        }

        const deleteMenuItem = menuItems.find((el) => {
          const testId = el.getAttribute("data-test-id")
          if (testId && testId.toLowerCase().includes("delete")) return true

          const icon = el.querySelector(DOM_SELECTORS.MENU_ICON)
          return !!(icon && icon.textContent?.toLowerCase().trim() === "delete")
        })

        if (!deleteMenuItem) {
          console.error("Delete menu item not found in context menu.")
          document.body.click()
          await wait(DELETE_WAIT_MS.MENU_NOT_FOUND)
          continue
        }

        // Wait for menu open animation to settle before clicking
        await wait(DELETE_WAIT_MS.MENU_ANIMATION)
        deleteMenuItem.click()
        
        // Wait up to 2 seconds for the confirmation dialog to appear
        let confirmBtnWrapper: HTMLElement | null = null
        let dialogWait = 0
        while (!confirmBtnWrapper && dialogWait < DELETE_WAIT_MS.DIALOG_APPEAR_MAX) {
          await wait(DELETE_WAIT_MS.POLL_INTERVAL)
          dialogWait += DELETE_WAIT_MS.POLL_INTERVAL
          confirmBtnWrapper = document.querySelector(
            DOM_SELECTORS.CONFIRM_BTN_WRAPPER
          ) as HTMLElement
        }

        let confirmBtn = confirmBtnWrapper
        if (confirmBtnWrapper && confirmBtnWrapper.tagName.toLowerCase() !== 'button') {
          confirmBtn = (confirmBtnWrapper.querySelector('button') || confirmBtnWrapper) as HTMLElement
        }

        if (confirmBtn) {
          // Wait for dialog open animation to settle before clicking
          await wait(DELETE_WAIT_MS.DIALOG_ANIMATION)
          confirmBtn.click()
          
          // Wait for dialog to close
          let dialogCloseWait = 0
          while (document.querySelector(DOM_SELECTORS.DIALOG_CONTAINER) && dialogCloseWait < DELETE_WAIT_MS.DIALOG_CLOSE_MAX) {
            await wait(DELETE_WAIT_MS.POLL_INTERVAL)
            dialogCloseWait += DELETE_WAIT_MS.POLL_INTERVAL
          }

          // If the dialog is still open, the click might have been ignored during animation. Retry!
          if (document.querySelector(DOM_SELECTORS.DIALOG_CONTAINER)) {
            console.warn("Retrying confirm button click...")
            confirmBtn.click()
            await wait(DELETE_WAIT_MS.RETRY_CLICK_WAIT)
          }

          // Wait up to 4 seconds for the chat item to be removed from the DOM
          let disappearWait = 0
          while (document.querySelector(`a[href="${href}"]`) && disappearWait < DELETE_WAIT_MS.DISAPPEAR_MAX) {
            await wait(DELETE_WAIT_MS.POLL_INTERVAL)
            disappearWait += DELETE_WAIT_MS.POLL_INTERVAL
          }
          
          await wait(DELETE_WAIT_MS.POST_DELETE)
        } else {
          console.error("Confirm button not found in delete dialog.")
          document.body.click()
          await wait(DELETE_WAIT_MS.RETRY_CLICK_WAIT)
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
      `body.gemini-bulk-select-mode ${DOM_SELECTORS.CHAT_ITEM} a {
         cursor: pointer !important;
         outline: 2px dashed rgba(26, 115, 232, 0.4) !important;
         outline-offset: -2px;
         border-radius: 9999px;
         transition: background-color 0.2s ease, outline 0.2s ease;
      }`,
      `body.gemini-bulk-select-mode ${DOM_SELECTORS.CHAT_ITEM} a:hover {
         background-color: rgba(26, 115, 232, 0.1) !important;
         outline-style: solid !important;
      }`
    ]

    Array.from(selectedHrefs).forEach((href) => {
      cssRules.push(
        `body.gemini-bulk-select-mode ${DOM_SELECTORS.CHAT_ITEM} a[href="${href}"] { 
           background-color: rgba(26, 115, 232, 0.15) !important; 
           outline: 2px solid #1a73e8 !important; 
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
          <span className="google-symbols gbr-bulk-delete-icon">
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
      <div className="gbr-bulk-delete-actions">
        <button
          onClick={handleCancelSelect}
          disabled={mode === "deleting"}
          className="bulk-delete-btn cancel"
          title={t("cancel")}>
          <span className="google-symbols gbr-bulk-delete-icon">
            close
          </span>
        </button>
        <button
          onClick={handleAddToFolderClick}
          disabled={mode === "deleting" || selectedHrefs.size === 0}
          className={`bulk-delete-btn ${mode === "deleting" ? "deleting" : ""}`}
          title={t("addToFolder")}>
          <span className="google-symbols gbr-bulk-delete-icon">
            folder
          </span>
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={mode === "deleting" || selectedHrefs.size === 0}
          className={`bulk-delete-btn delete-action ${mode === "deleting" ? "deleting" : ""}`}
          title={t("deleteChatsTitle")}>
          <span className="google-symbols gbr-bulk-delete-icon">
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
