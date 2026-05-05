// components/ModalListItem.tsx
import React, { useState } from "react"
import { OpenInNewIcon, CopyIcon, CheckIcon, CloseIcon } from "./Icons"
import { useTranslation } from "react-i18next"

interface ModalListItemProps {
  id: string
  text: string
  timestamp: number
  url?: string
  icon: React.ReactNode
  iconColorClass: string // "star", "bookmark", "document"
  onCopy: (id: string, text: string) => void
  onDelete: (id: string) => void
  isCopied: boolean
  dateFormat?: Intl.DateTimeFormatOptions
}

const ModalListItem: React.FC<ModalListItemProps> = ({
  id,
  text,
  timestamp,
  url,
  icon,
  iconColorClass,
  onCopy,
  onDelete,
  isCopied,
  dateFormat = { day: "numeric", month: "long", year: "numeric" }
}) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => setIsExpanded(!isExpanded)

  return (
    <li className="list-item-container">
      <div className="list-item-main">
        <span className={`list-item-icon ${iconColorClass}`}>
          {icon}
        </span>
        <div className="list-item-text">
          <div
            className={`list-item-title ${isExpanded ? "expanded" : ""}`}
            style={iconColorClass === "document" ? { whiteSpace: "pre-wrap", wordBreak: "break-word" } : {}}
          >
            {text}
          </div>
          {text.length > 200 && (
            <button className="favorite-expand-btn" onClick={toggleExpand}>
              {isExpanded ? t("showLess") : t("readMore")}
            </button>
          )}
          <div className="list-item-metadata">
            <span>
              {new Date(timestamp).toLocaleDateString("tr-TR", dateFormat)}
            </span>
            {url && (
              <>
                <span className="separator">•</span>
                <a
                  href={url}
                  className="favorite-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  <OpenInNewIcon size={14} />
                  {t("goToChat")}
                </a>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="list-item-actions">
        <button
          className={`favorite-copy-btn ${isCopied ? "copied" : ""}`}
          onClick={() => onCopy(id, text)}
          title={t("copyText")}
        >
          {isCopied ? <CheckIcon size={20} /> : <CopyIcon size={20} />}
        </button>
        <button
          className="favorite-delete-btn"
          onClick={() => onDelete(id)}
          title={t("delete")}
        >
          <CloseIcon size={20} />
        </button>
      </div>
    </li>
  )
}

export default ModalListItem
