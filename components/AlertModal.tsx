// components/AlertModal.tsx
import React from "react"

interface AlertModalProps {
  title: string
  message: string
  onClose: () => void
  closeText: string
}

const AlertModal: React.FC<AlertModalProps> = ({
  title,
  message,
  onClose,
  closeText
}) => {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={modalTitleStyle}>{title}</h3>
        <p style={modalTextStyle}>{message}</p>
        <div style={modalActionsStyle}>
          <button onClick={onClose} style={modalPrimaryBtnStyle}>
            {closeText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Common Modal Styles (shared with ConfirmModal, kept here for independence)
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(2px)",
  zIndex: 999999,
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

const modalPrimaryBtnStyle: React.CSSProperties = {
  ...modalBtnBaseStyle,
  backgroundColor: "var(--gem-sys-color--primary, #a8c7fa)",
  color: "var(--gem-sys-color--on-primary, #000)"
}

export default AlertModal
