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

// components/SearchResultItem.tsx
import React from "react"

interface SearchResultItemProps {
  text: string
  onCopy: () => void
  isCopied: boolean
  copyText: string
  copiedText: string
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  text,
  onCopy,
  isCopied,
  copyText,
  copiedText
}) => {
  return (
    <div style={searchResultStyle}>
      <div style={searchResultTextStyle}>{text}</div>
      <button onClick={onCopy} style={copyBtnStyle(isCopied)}>
        {isCopied ? copiedText : copyText}
      </button>
    </div>
  )
}

const searchResultStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#25252d",
  padding: "10px",
  borderRadius: "6px",
  marginBottom: "8px",
  border: "1px solid #333",
  gap: "8px"
}

const searchResultTextStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#ccc",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  flex: 1
}

const copyBtnStyle = (copied: boolean): React.CSSProperties => ({
  background: copied ? "#00b894" : "#444",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  padding: "4px 8px",
  fontSize: "11px",
  cursor: "pointer",
  minWidth: "60px",
  transition: "background 0.2s"
})

export default SearchResultItem
