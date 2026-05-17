// components/NotesTab.tsx — Notes tab content for the main modal
import React from "react"
import { useTranslation } from "react-i18next"

import type { Note } from "../types/note"
import EmptyState from "./EmptyState"
import { DocumentIcon } from "./Icons"
import ModalListItem from "./ModalListItem"

interface NotesTabProps {
  notes: Note[]
  filteredNotes: Note[]
  newNoteText: string
  copiedIds: Record<string, boolean>
  onNewNoteTextChange: (text: string) => void
  onSaveNote: () => void
  onCopy: (id: string, text: string) => Promise<void>
  onDelete: (id: string) => void
}

const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  filteredNotes,
  newNoteText,
  copiedIds,
  onNewNoteTextChange,
  onSaveNote,
  onCopy,
  onDelete
}) => {
  const { t } = useTranslation()

  return (
    <div className="notes-container">
      <div className="note-input-area">
        <textarea
          className="note-textarea"
          placeholder={t("writeNewNote")}
          value={newNoteText}
          onChange={(e) => onNewNoteTextChange(e.target.value)}
        />
        <div className="note-save-btn-row">
          <button
            onClick={onSaveNote}
            disabled={!newNoteText.trim()}
            className="note-save-btn">
            {t("saveNote")}
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={<DocumentIcon size={40} />}
          title={t("noNotes")}
        />
      ) : filteredNotes.length === 0 ? (
        <div className="favorites-empty">
          <p className="modal-desc">{t("noNotesMatch")}</p>
        </div>
      ) : (
        <ul className="item-list">
          {filteredNotes.map((n) => (
            <ModalListItem
              key={n.id}
              id={n.id}
              text={n.text}
              timestamp={n.createdAt}
              icon={<DocumentIcon size={24} />}
              iconColorClass="document"
              onCopy={onCopy}
              onDelete={onDelete}
              isCopied={!!copiedIds[n.id]}
              dateFormat={{
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default NotesTab
