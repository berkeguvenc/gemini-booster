import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import "../i18n"

import AlertModal from "../components/AlertModal"
import ConfirmModal from "../components/ConfirmModal"
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
    document.querySelector(
      "conversations-list .title-container:has(h1.title)"
    ) || document.querySelector(".title-container:has(h1.title)")
  return container ? { element: container, insertPosition: "beforeend" } : null
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const GeminiBulkDelete = () => {
  const [enabled, setEnabled] = useState(true)
  const [mode, setMode] = useState<"idle" | "selecting" | "deleting">("idle")
  const [selectedHrefs, setSelectedHrefs] = useState<Set<string>>(new Set())
  const [showConfirm, setShowConfirm] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [folders, setFolders] = useState<any[]>([])
  const [newFolderName, setNewFolderName] = useState("")
  const [alertMessage, setAlertMessage] = useState("")

  const { t, i18n } = useTranslation()

  useEffect(() => {
    chrome.storage.sync.get(
      ["gbr_settings_bulk_delete", "gbr_settings_language"],
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

    chrome.storage.local.get("gemini_folders", (res) => {
      const result = res as LocalStorageData
      setFolders(result.gemini_folders || [])
    })

    const handleFoldersUpdated = () => {
      chrome.storage.local.get("gemini_folders", (res) => {
        const result = res as LocalStorageData
        setFolders(result.gemini_folders || [])
      })
    }
    window.addEventListener("FOLDERS_UPDATED", handleFoldersUpdated)

    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      namespace: string
    ) => {
      if (namespace === "sync") {
        if (changes.gbr_settings_bulk_delete)
          setEnabled(changes.gbr_settings_bulk_delete.newValue as boolean)
        if (changes.gbr_settings_language)
          i18n.changeLanguage(changes.gbr_settings_language.newValue as string)
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => {
      chrome.storage.onChanged.removeListener(listener)
      window.removeEventListener("FOLDERS_UPDATED", handleFoldersUpdated)
    }
  }, [i18n])

  // Apply flexbox styles to the parent container to align the button perfectly
  useEffect(() => {
    const container = document.querySelector(
      "conversations-list .title-container:has(h1.title)"
    ) as HTMLElement
    if (container) {
      container.style.display = "flex"
      container.style.justifyContent = "space-between"
      container.style.alignItems = "center"
      container.style.paddingRight = "12px"
      container.style.visibility = "visible"
    }
  }, [])

  // Handle global clicks during "selecting" mode
  useEffect(() => {
    if (mode !== "selecting") return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[data-test-id="conversation"]')

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

    // Add capturing listener to stop navigation
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

  const getSelectedChatsData = () => {
    const chats: { id: string; title: string; url: string; addedAt: number }[] =
      []
    for (const href of selectedHrefs) {
      const anchor = document.querySelector(`a[href="${href}"]`)
      let title = "Unknown Chat"
      if (anchor) {
        // Try to get title from inner span/div, or use textContent
        title = anchor.textContent?.trim() || "Unknown Chat"
        // Clean up title (remove "Options" text if present)
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
        const existingIds = new Set(f.chats.map((c: any) => c.id))
        const newChats = chatsToAdd.filter((c) => !existingIds.has(c.id))
        return { ...f, chats: [...newChats, ...f.chats] }
      }
      return f
    })

    chrome.storage.local.set({ gemini_folders: updatedFolders }, () => {
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
    const newFolder = {
      id:
        "folder_" +
        Date.now().toString() +
        Math.random().toString(36).substr(2, 5),
      name: newFolderName.trim(),
      createdAt: Date.now(),
      chats: getSelectedChatsData()
    }

    const updatedFolders = [newFolder, ...folders]
    chrome.storage.local.set({ gemini_folders: updatedFolders }, () => {
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

    try {
      // Iterate through selected items
      for (const href of selectedHrefs) {
        // Look for the anchor tag in the DOM
        const anchor = document.querySelector(`a[href="${href}"]`)
        if (!anchor) {
          console.warn(`Sohbet bulunamadı veya ekranda değil: ${href}`)
          continue // skip if not loaded
        }

        // The options button is a sibling or nearby. Usually in .conversation-actions-container
        const actionsBtn = anchor.parentElement?.querySelector(
          'button[data-test-id="actions-menu-button"]'
        ) as HTMLElement

        if (!actionsBtn) {
          console.warn(`Seçenekler butonu bulunamadı: ${href}`)
          continue
        }

        actionsBtn.click()
        await wait(400) // wait for menu

        // Find "Sil" / "Delete" in the opened menu
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
          console.error("Menüde Sil/Delete seçeneği bulunamadı.")
          // close menu by clicking outside (simulate) or just move on
          document.body.click()
          continue
        }

        deleteMenuItem.click()
        await wait(400) // wait for confirm dialog

        // Find confirm button in the dialog
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
          await wait(800) // wait for deletion request to finish and list to update
        } else {
          console.error("Onay penceresindeki buton bulunamadı.")
          document.body.click() // try to close dialog
        }
      }
      setAlertMessage(t("chatsDeletedSuccess"))
    } catch (err) {
      console.error("Silme işlemi sırasında hata:", err)
      setAlertMessage(t("deleteError"))
    } finally {
      setMode("idle")
      setSelectedHrefs(new Set())
    }
  }

  // Manage global CSS for selection state
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
      `body.gemini-bulk-select-mode a[data-test-id="conversation"] {
         cursor: pointer !important;
         border: 2px dashed rgba(26, 115, 232, 0.4) !important;
         border-radius: 8px;
         margin-top: 2px;
         margin-bottom: 2px;
         transition: all 0.2s ease;
      }`,
      `body.gemini-bulk-select-mode a[data-test-id="conversation"]:hover {
         background-color: rgba(26, 115, 232, 0.1) !important;
         border-style: solid !important;
      }`
    ]

    Array.from(selectedHrefs).forEach((href) => {
      cssRules.push(
        `body.gemini-bulk-select-mode a[data-test-id="conversation"][href="${href}"] { 
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
      <button
        onClick={handleStartSelect}
        className="bulk-delete-btn"
        title={t("bulkSelect")}>
        <span className="google-symbols" style={{ fontSize: "18px" }}>
          checklist
        </span>
        <span className="text">{t("bulkSelect")}</span>
      </button>
    )
  }

  return (
    <>
      <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
        <button
          onClick={handleCancelSelect}
          disabled={mode === "deleting"}
          className="bulk-delete-btn cancel"
          style={{ marginLeft: 0 }}>
          <span className="text">{t("cancel")}</span>
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
          <span className="text">
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
        <div className="modal-overlay dark" style={{ zIndex: 9999 }}>
          <div
            className="modal-clickaway"
            onClick={() => setShowFolderModal(false)}></div>
          <div
            className="modal-box"
            style={{
              padding: "24px",
              maxWidth: "400px",
              background: "var(--gem-sys-color--surface, #131314)",
              borderRadius: "24px"
            }}>
            <h2
              style={{
                color: "var(--gem-sys-color--on-surface, #e3e3e3)",
                marginBottom: "16px",
                fontSize: "18px"
              }}>
              {t("selectFolder")}
            </h2>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={t("createNewFolder")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border:
                    "1px solid var(--gem-sys-color--outline-variant, #444746)",
                  background:
                    "var(--gem-sys-color--surface-container-high, #282a2c)",
                  color: "var(--gem-sys-color--on-surface, #e3e3e3)",
                  outline: "none",
                  fontSize: "14px"
                }}
              />
              <button
                onClick={handleCreateAndAdd}
                disabled={!newFolderName.trim()}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "var(--gem-sys-color--primary, #a8c7fa)",
                  color: "var(--gem-sys-color--on-primary, #000)",
                  border: "none",
                  cursor: newFolderName.trim() ? "pointer" : "not-allowed",
                  opacity: newFolderName.trim() ? 1 : 0.5,
                  fontWeight: 500,
                  fontSize: "14px"
                }}>
                {t("create")}
              </button>
            </div>

            {folders.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  maxHeight: "300px",
                  overflowY: "auto"
                }}>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => addChatsToFolder(f.id)}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      background:
                        "var(--gem-sys-color--surface-container, #1e1f20)",
                      color: "var(--gem-sys-color--on-surface, #e3e3e3)",
                      borderRadius: "12px",
                      border:
                        "1px solid var(--gem-sys-color--surface-variant, #444746)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center"
                    }}>
                    <span
                      className="google-symbols"
                      style={{
                        fontSize: "20px",
                        marginRight: "12px",
                        color: "var(--gem-sys-color--primary, #a8c7fa)"
                      }}>
                      folder
                    </span>
                    <span style={{ fontSize: "14px" }}>{f.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "var(--gem-sys-color--on-surface-variant, #c4c7c5)",
                  fontSize: "14px"
                }}>
                {t("noFolders")}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px"
              }}>
              <button
                onClick={() => setShowFolderModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--gem-sys-color--on-surface-variant, #c4c7c5)",
                  cursor: "pointer",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: 500
                }}>
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GeminiBulkDelete
