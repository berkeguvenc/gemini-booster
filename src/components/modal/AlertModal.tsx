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
    <div className="gbr-modal-overlay">
      <div className="gbr-confirm-modal">
        <h3 className="gbr-confirm-modal-title">{title}</h3>
        <p className="gbr-confirm-modal-text">{message}</p>
        <div className="gbr-confirm-modal-actions">
          <button onClick={onClose} className="gbr-confirm-modal-btn gbr-confirm-modal-btn-primary">
            {closeText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertModal
