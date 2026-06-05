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

// components/ListItem.tsx
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

import { EXPAND_THRESHOLD } from "../../../constants"
import { OpenInNewIcon, CopyIcon, CheckIcon, CloseIcon } from "../../Icons"

interface ListItemProps {
  id: string
  text: string
  timestamp: number
  url?: string
  icon: React.ReactNode
  iconColorClass: string // "star", "bookmark", "document"
  onCopy?: (id: string, text: string) => void
  onDelete: (id: string) => void
  isCopied: boolean
  dateFormat?: Intl.DateTimeFormatOptions
}

const ListItem: React.FC<ListItemProps> = ({
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
  const { t, i18n } = useTranslation()
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
          >
            {text}
          </div>
          {text.length > EXPAND_THRESHOLD && (
            <button className="favorite-expand-btn" onClick={toggleExpand}>
              {isExpanded ? t("showLess") : t("readMore")}
            </button>
          )}
          <div className="list-item-metadata">
            <span>
              {new Date(timestamp).toLocaleDateString(
                i18n.language === "tr" ? "tr-TR" : "en-US",
                dateFormat
              )}
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
        {onCopy && (
          <button
            className={`favorite-copy-btn ${isCopied ? "copied" : ""}`}
            onClick={() => onCopy(id, text)}
            title={t("copyText")}
          >
            {isCopied ? <CheckIcon size={20} /> : <CopyIcon size={20} />}
          </button>
        )}
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

export default ListItem
