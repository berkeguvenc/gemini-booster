/*
 * Copyright (C) 2026 Yağız Berke Güvenç
 *
 * This file is part of gemini-booster.
 *
 * gemini-booster is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * gemini-booster is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with gemini-booster. If not, see <https://www.gnu.org/licenses/>.
 */

// components/PromptsModal.tsx — Prompts tab content for the main modal
import React from "react"
import { useTranslation } from "react-i18next"

import type { SavedPrompt } from "../../types/prompt"
import EmptyState from "./components/EmptyState"
import { BookmarkIcon } from "../Icons"
import ListItem from "./components/ListItem"

interface PromptsModalProps {
  prompts: SavedPrompt[]
  filteredPrompts: SavedPrompt[]
  copiedIds: Record<string, boolean>
  onCopy: (id: string, text: string) => Promise<void>
  onDelete: (id: string) => void
}

const PromptsModal: React.FC<PromptsModalProps> = ({
  prompts,
  filteredPrompts,
  copiedIds,
  onCopy,
  onDelete
}) => {
  const { t } = useTranslation()

  if (prompts.length === 0) {
    return (
      <EmptyState
        icon={<BookmarkIcon size={40} />}
        title={t("noPrompts")}
        description={t("noPromptsDesc")}
      />
    )
  }

  if (filteredPrompts.length === 0) {
    return (
      <div className="favorites-empty">
        <p className="modal-desc">{t("noPromptsMatch")}</p>
      </div>
    )
  }

  return (
    <ul className="item-list">
      {filteredPrompts.map((p) => (
        <ListItem
          key={p.id}
          id={p.id}
          text={p.text}
          timestamp={p.savedAt}
          url={p.url}
          icon={<BookmarkIcon size={24} />}
          iconColorClass="bookmark"
          onCopy={onCopy}
          onDelete={onDelete}
          isCopied={!!copiedIds[p.id]}
        />
      ))}
    </ul>
  )
}

export default PromptsModal
