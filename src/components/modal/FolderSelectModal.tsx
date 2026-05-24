// components/FolderSelectModal.tsx — Modal for selecting/creating a folder (used in bulk delete)
import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"

import type { ChatFolder } from "../../types/folder"

interface FolderSelectModalProps {
  folders: ChatFolder[]
  newFolderName: string
  onNewFolderNameChange: (name: string) => void
  onCreateAndAdd: () => void
  onSelectFolder: (folderId: string) => void
  onClose: () => void
}

const FolderSelectModal: React.FC<FolderSelectModalProps> = ({
  folders,
  newFolderName,
  onNewFolderNameChange,
  onCreateAndAdd,
  onSelectFolder,
  onClose
}) => {
  const { t } = useTranslation()
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const checkTheme = () =>
      setIsDark(document.body.classList.contains("dark-theme"))

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    })

    return () => observer.disconnect()
  }, [])


  return (
    <div className={`modal-overlay ${isDark ? "dark" : ""}`} style={{ zIndex: 9999 }}>
      <div className="modal-clickaway" onClick={onClose}></div>
      <div className="modal-box folder-select-box">
        <h2 className="folder-select-title">{t("selectFolder")}</h2>

        <div className="folder-select-create-row">
          <input
            value={newFolderName}
            onChange={(e) => onNewFolderNameChange(e.target.value)}
            placeholder={t("createNewFolder")}
            className="folder-name-input"
          />
          <button
            onClick={onCreateAndAdd}
            disabled={!newFolderName.trim()}
            className="folder-create-btn">
            {t("create")}
          </button>
        </div>

        {folders.length > 0 ? (
          <div className="folder-select-list">
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => onSelectFolder(f.id)}
                className="folder-select-item">
                <span className="google-symbols folder-select-item-icon">
                  folder
                </span>
                <span className="folder-select-item-name">{f.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="folder-select-empty">
            {t("noFolders")}
          </div>
        )}

        <div className="folder-select-footer">
          <button onClick={onClose} className="folder-select-cancel">
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FolderSelectModal
