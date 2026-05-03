import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect, useState } from "react"

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
  const [alertMessage, setAlertMessage] = useState("")

  useEffect(() => {
    chrome.storage.sync.get("gbr_settings_bulk_delete", (res) => {
      if (res.gbr_settings_bulk_delete !== undefined) {
        setEnabled(res.gbr_settings_bulk_delete)
      }
    })

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, namespace: string) => {
      if (namespace === "sync" && changes.gbr_settings_bulk_delete) {
        setEnabled(changes.gbr_settings_bulk_delete.newValue)
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

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

  const handleDeleteClick = () => {
    if (selectedHrefs.size === 0) {
      setAlertMessage("Lütfen silinecek sohbetleri seçin.")
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

        const deleteMenuItem = menuItems.find(
          (el) =>
            el.textContent?.toLowerCase().includes("sil") ||
            el.textContent?.toLowerCase().includes("delete")
        )

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
          (el) =>
            el.textContent?.toLowerCase().includes("sil") ||
            el.textContent?.toLowerCase().includes("delete") ||
            el.textContent?.toLowerCase().includes("confirm")
        )

        if (confirmBtn) {
          confirmBtn.click()
          await wait(800) // wait for deletion request to finish and list to update
        } else {
          console.error("Onay penceresindeki buton bulunamadı.")
          document.body.click() // try to close dialog
        }
      }
      setAlertMessage("Seçilen sohbetler başarıyla silindi.")
    } catch (err) {
      console.error("Silme işlemi sırasında hata:", err)
      setAlertMessage("Bir hata oluştu, işlem durduruldu.")
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
        title="Toplu Seç">
        <span className="icon">☑️</span>
        <span className="text">Toplu Seç</span>
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
          <span className="text">İptal</span>
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={mode === "deleting" || selectedHrefs.size === 0}
          className={`bulk-delete-btn ${mode === "deleting" ? "deleting" : ""}`}
          style={{ marginLeft: 0 }}
          title="Seçilenleri Sil">
          <span className="icon">🗑️</span>
          <span className="text">
            {mode === "deleting" ? "Siliniyor..." : `Sil (${selectedHrefs.size})`}
          </span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>Sohbetleri Sil</h3>
            <p style={modalTextStyle}>
              Seçilen {selectedHrefs.size} sohbeti kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div style={modalActionsStyle}>
              <button
                onClick={() => setShowConfirm(false)}
                style={modalCancelBtnStyle}
              >
                İptal
              </button>
              <button
                onClick={executeDelete}
                style={modalDeleteBtnStyle}
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertMessage && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>Bilgi</h3>
            <p style={modalTextStyle}>{alertMessage}</p>
            <div style={modalActionsStyle}>
              <button
                onClick={() => setAlertMessage("")}
                style={modalPrimaryBtnStyle}
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Modal Styles
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(2px)",
  zIndex: 999999,
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}

const modalStyle: React.CSSProperties = {
  backgroundColor: "var(--gem-sys-color--surface, #1e1f20)",
  color: "var(--gem-sys-color--on-surface, #e3e3e3)",
  padding: "24px",
  borderRadius: "16px",
  maxWidth: "400px",
  width: "90%",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  fontFamily: "'Google Sans', 'Google Sans Flex', Roboto, sans-serif"
}

const modalTitleStyle: React.CSSProperties = {
  margin: "0 0 16px 0",
  fontSize: "20px",
  fontWeight: 500
}

const modalTextStyle: React.CSSProperties = {
  margin: "0 0 24px 0",
  fontSize: "14px",
  lineHeight: "1.5",
  color: "var(--gem-sys-color--on-surface-variant, #c4c7c5)"
}

const modalActionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px"
}

const modalBtnBaseStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  border: "none",
  transition: "background-color 0.2s"
}

const modalCancelBtnStyle: React.CSSProperties = {
  ...modalBtnBaseStyle,
  backgroundColor: "transparent",
  color: "var(--gem-sys-color--primary, #a8c7fa)"
}

const modalDeleteBtnStyle: React.CSSProperties = {
  ...modalBtnBaseStyle,
  backgroundColor: "#f28b82", // Google Red light
  color: "#000"
}

const modalPrimaryBtnStyle: React.CSSProperties = {
  ...modalBtnBaseStyle,
  backgroundColor: "var(--gem-sys-color--primary, #a8c7fa)",
  color: "var(--gem-sys-color--on-primary, #000)"
}

export default GeminiBulkDelete
