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

// components/NotesModal.tsx — Notes tab content for the main modal
import React from "react"
import { useTranslation } from "react-i18next"

import type { Note } from "../../types/note"
import EmptyState from "./components/EmptyState"
import { DocumentIcon } from "../Icons"
import ListItem from "./components/ListItem"

interface NotesModalProps {
  notes: Note[]
  filteredNotes: Note[]
  newNoteText: string
  copiedIds: Record<string, boolean>
  onNewNoteTextChange: (text: string) => void
  onSaveNote: () => void
  onCopy: (id: string, text: string) => Promise<void>
  onDelete: (id: string) => void
}

const NotesModal: React.FC<NotesModalProps> = ({
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
    <div>
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
            <ListItem
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

export default NotesModal
