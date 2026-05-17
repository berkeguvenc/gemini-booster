// components/PromptsTab.tsx — Prompts tab content for the main modal
import React from "react"
import { useTranslation } from "react-i18next"

import type { SavedPrompt } from "../types/prompt"
import EmptyState from "./EmptyState"
import { BookmarkIcon } from "./Icons"
import ModalListItem from "./ModalListItem"

interface PromptsTabProps {
  prompts: SavedPrompt[]
  filteredPrompts: SavedPrompt[]
  copiedIds: Record<string, boolean>
  onCopy: (id: string, text: string) => Promise<void>
  onDelete: (id: string) => void
}

const PromptsTab: React.FC<PromptsTabProps> = ({
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
        <ModalListItem
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

export default PromptsTab
