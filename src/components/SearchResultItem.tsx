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
