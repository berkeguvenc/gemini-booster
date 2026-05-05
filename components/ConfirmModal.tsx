// components/ConfirmModal.tsx
import React from "react"

interface ConfirmModalProps {
  title: string
  description: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
  confirmText: string
  cancelText: string
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText,
  cancelText
}) => {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={modalTitleStyle}>{title}</h3>
        <p style={modalTextStyle}>{description}</p>
        <div style={modalActionsStyle}>
          <button onClick={onCancel} style={modalCancelBtnStyle}>
            {cancelText}
          </button>
          <button onClick={onConfirm} style={modalDeleteBtnStyle}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Common Modal Styles
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.6)", // Changed to match popup.tsx (0.6) as a middle ground
  backdropFilter: "blur(2px)",
  zIndex: 999999, // Max z-index to cover everything
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}

const modalStyle: React.CSSProperties = {
  backgroundColor: "var(--gem-sys-color--surface, #1e1f20)",
  color: "var(--gem-sys-color--on-surface, #e3e3e3)",
  padding: "24px",
  borderRadius: "16px",
  maxWidth: "400px",
  width: "90%",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  fontFamily: "'Google Sans', 'Google Sans Flex', Roboto, sans-serif"
}

const modalTitleStyle: React.CSSProperties = {
  margin: "0 0 16px 0",
  fontSize: "20px",
  fontWeight: 500
}

const modalTextStyle: React.CSSProperties = {
  margin: "0 0 24px 0",
  fontSize: "14px",
  lineHeight: "1.5",
  color: "var(--gem-sys-color--on-surface-variant, #c4c7c5)"
}

const modalActionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px"
}

const modalBtnBaseStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  border: "none",
  transition: "background-color 0.2s"
}

const modalCancelBtnStyle: React.CSSProperties = {
  ...modalBtnBaseStyle,
  backgroundColor: "transparent",
  color: "var(--gem-sys-color--primary, #a8c7fa)"
}

const modalDeleteBtnStyle: React.CSSProperties = {
  ...modalBtnBaseStyle,
  backgroundColor: "#f28b82",
  color: "#000"
}

export default ConfirmModal
