import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"

import type { ChatFolder } from "../../types/folder"
import EmptyState from "./components/EmptyState"
import { FolderIcon } from "../Icons"
import ListItem from "./components/ListItem"
import ConfirmModal from "./ConfirmModal"

export interface FoldersModalProps {
  mode?: "manage" | "select"
  folders: ChatFolder[]
  newFolderName: string
  onNewFolderNameChange: (name: string) => void
  onCreateFolder: () => void

  // Manage mode specific props (optional)
  filteredFolders?: ChatFolder[]
  expandedFolderId?: string | null
  copiedIds?: Record<string, boolean>
  onDeleteFolder?: (id: string) => void
  onToggleExpand?: (id: string) => void
  onRemoveChatFromFolder?: (folderId: string, chatId: string) => void
  onCopy?: (id: string, text: string) => Promise<void>

  // Select mode specific props (optional)
  onSelectFolder?: (folderId: string) => void
  onClose?: () => void
}

const FoldersModal: React.FC<FoldersModalProps> = ({
  mode = "manage",
  folders,
  filteredFolders,
  newFolderName,
  expandedFolderId,
  copiedIds,
  onNewFolderNameChange,
  onCreateFolder,
  onDeleteFolder,
  onToggleExpand,
  onRemoveChatFromFolder,
  onCopy,
  onSelectFolder,
  onClose
}) => {
  const { t } = useTranslation()
  const [isDark, setIsDark] = useState(true)
  const [folderToDeleteId, setFolderToDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== "select") return

    const checkTheme = () =>
      setIsDark(document.body.classList.contains("dark-theme"))

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    })

    return () => observer.disconnect()
  }, [mode])

  const foldersToList = mode === "select" ? folders : (filteredFolders || folders)

  const renderContent = () => (
    <div>
      <div className="folder-create-row">
        <input
          type="text"
          className="folder-name-input"
          placeholder={t("createNewFolder")}
          value={newFolderName}
          onChange={(e) => onNewFolderNameChange(e.target.value)}
        />
        <button
          onClick={onCreateFolder}
          disabled={!newFolderName.trim()}
          className="folder-create-btn">
          {t("create")}
        </button>
      </div>

      {folders.length === 0 ? (
        <EmptyState
          icon={<FolderIcon size={40} />}
          title={t("noFolders")}
          description={t("noFoldersDesc")}
        />
      ) : foldersToList.length === 0 ? (
        <div className="favorites-empty">
          <p className="modal-desc">{t("noFolders")}</p>
        </div>
      ) : (
        <ul className="item-list" style={{ marginTop: "16px", padding: "0 12px" }}>
          {foldersToList.map((f) => (
            <li key={f.id} style={{ marginBottom: "12px", listStyle: "none" }}>
              <div
                className="folder-card"
                onClick={() => {
                  if (mode === "select") {
                    onSelectFolder?.(f.id)
                  } else {
                    onToggleExpand?.(f.id)
                  }
                }}>
                <div className="folder-card-info">
                  <span className="folder-card-icon">
                    <FolderIcon size={24} />
                  </span>
                  <span className="folder-card-name">
                    {f.name} ({f.chats.length})
                  </span>
                </div>
                {mode === "manage" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setFolderToDeleteId(f.id)
                    }}
                    className="folder-card-delete"
                    title={t("delete")}>
                    <span className="google-symbols" style={{ fontSize: "20px" }}>delete</span>
                  </button>
                )}
              </div>

              {mode === "manage" && expandedFolderId === f.id && (
                <div className="folder-chats-list">
                  {f.chats.length === 0 ? (
                    <div className="folder-empty-msg">
                      {t("emptyFolder")}
                    </div>
                  ) : (
                    <ul style={{ padding: 0, margin: 0 }}>
                      {f.chats.map((chat) => (
                        <ListItem
                          key={chat.id}
                          id={chat.id}
                          text={chat.title}
                          timestamp={chat.addedAt}
                          url={chat.url}
                          icon={<span className="google-symbols" style={{ fontSize: "20px" }}>chat</span>}
                          iconColorClass="default"
                          onCopy={onCopy || (async () => {})}
                          onDelete={(id) => onRemoveChatFromFolder?.(f.id, id)}
                          isCopied={false}
                          dateFormat={{
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          }}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {mode === "select" && (
        <div className="folder-select-footer">
          <button onClick={onClose} className="folder-select-cancel">
            {t("cancel")}
          </button>
        </div>
      )}
    </div>
  )

  if (mode === "select") {
    return (
      <div className={`modal-overlay ${isDark ? "dark" : ""}`} style={{ zIndex: 9999 }}>
        <div className="modal-clickaway" onClick={onClose}></div>
        <div className="modal-box">
          <div className="modal-header">
            <div className="modal-title-container">
              <span className="header-icon">
                <FolderIcon size={32} />
              </span>
              <h2 className="modal-title">{t("selectFolder")}</h2>
            </div>
            <button
              onClick={onClose}
              className="modal-close-btn"
              aria-label={t("close")}>
              <span className="google-symbols" style={{ fontSize: "24px" }}>close</span>
            </button>
          </div>

          <div className="modal-content">
            {renderContent()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {renderContent()}
      {folderToDeleteId && (
        <ConfirmModal
          title={t("deleteFolderTitle")}
          description={t("deleteFolderDesc")}
          confirmText={t("delete")}
          cancelText={t("cancel")}
          onConfirm={() => {
            onDeleteFolder?.(folderToDeleteId)
            setFolderToDeleteId(null)
          }}
          onCancel={() => setFolderToDeleteId(null)}
          variant="danger"
        />
      )}
    </>
  )
}

export default FoldersModal
