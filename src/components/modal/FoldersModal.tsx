// components/FoldersModal.tsx — Folders tab content for the main modal
import React from "react"
import { useTranslation } from "react-i18next"

import type { ChatFolder } from "../../types/folder"
import EmptyState from "./components/EmptyState"
import { FolderIcon } from "../Icons"
import ListItem from "./components/ListItem"

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
