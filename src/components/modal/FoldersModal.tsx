import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"

import type { ChatFolder } from "../../types/folder"
import EmptyState from "./components/EmptyState"
import { FolderIcon } from "../Icons"
import ListItem from "./components/ListItem"

export interface FolderSelectModalProps {
  folders: ChatFolder[]
  newFolderName: string
  onNewFolderNameChange: (name: string) => void
  onCreateAndAdd: () => void
  onSelectFolder: (folderId: string) => void
  onClose: () => void
}

export const FolderSelectModal: React.FC<FolderSelectModalProps> = ({
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
      <div className="modal-box">
        <div className="modal-header" style={{ paddingBottom: "16px" }}>
          <div className="modal-title-container">
            <span className="header-icon" style={{ color: "#a8c7fa" }}>
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

        <div className="modal-content" style={{ maxHeight: "400px", padding: "0 24px 24px 24px", overflowY: "auto" }}>
          <div className="folder-create-row" style={{ margin: "0 0 16px 0" }}>
            <input
              type="text"
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

          {folders.length === 0 ? (
            <EmptyState
              icon={<FolderIcon size={40} />}
              title={t("noFolders")}
              description={t("noFoldersDesc")}
            />
          ) : (
            <ul className="item-list" style={{ padding: 0, margin: 0 }}>
              {folders.map((f) => (
                <li key={f.id} style={{ marginBottom: "12px", listStyle: "none" }}>
                  <div
                    className="folder-card"
                    onClick={() => onSelectFolder(f.id)}>
                    <div className="folder-card-info">
                      <span className="folder-card-icon">
                        <FolderIcon size={24} />
                      </span>
                      <span className="folder-card-name">
                        {f.name} ({f.chats.length})
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
            <button
              onClick={onClose}
              className="folder-create-btn"
              style={{ background: "transparent", color: "#a8c7fa" }}>
              {t("cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FoldersModalProps {
  folders: ChatFolder[]
  filteredFolders: ChatFolder[]
  newFolderName: string
  expandedFolderId: string | null
  copiedIds: Record<string, boolean>
  onNewFolderNameChange: (name: string) => void
  onCreateFolder: () => void
  onDeleteFolder: (id: string) => void
  onToggleExpand: (id: string) => void
  onRemoveChatFromFolder: (folderId: string, chatId: string) => void
  onCopy: (id: string, text: string) => Promise<void>
}

const FoldersModal: React.FC<FoldersModalProps> = ({
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
  onCopy
}) => {
  const { t } = useTranslation()

  return (
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
      ) : filteredFolders.length === 0 ? (
        <div className="favorites-empty">
          <p className="modal-desc">{t("noFolders")}</p>
        </div>
      ) : (
        <ul className="item-list" style={{ marginTop: "16px", padding: "0 12px" }}>
          {filteredFolders.map((f) => (
            <li key={f.id} style={{ marginBottom: "12px", listStyle: "none" }}>
              <div
                className="folder-card"
                onClick={() => onToggleExpand(f.id)}>
                <div className="folder-card-info">
                  <span className="folder-card-icon">
                    <FolderIcon size={24} />
                  </span>
                  <span className="folder-card-name">
                    {f.name} ({f.chats.length})
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(t("delete"))) onDeleteFolder(f.id)
                  }}
                  className="folder-card-delete"
                  title={t("delete")}>
                  <span className="google-symbols" style={{ fontSize: "20px" }}>delete</span>
                </button>
              </div>

              {expandedFolderId === f.id && (
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
                          onCopy={onCopy}
                          onDelete={(id) => onRemoveChatFromFolder(f.id, id)}
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
    </div>
  )
}

export default FoldersModal
