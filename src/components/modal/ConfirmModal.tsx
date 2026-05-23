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
    <div className="gbr-modal-overlay">
      <div className="gbr-confirm-modal">
        <h3 className="gbr-confirm-modal-title">{title}</h3>
        <p className="gbr-confirm-modal-text">{description}</p>
        <div className="gbr-confirm-modal-actions">
          <button onClick={onCancel} className="gbr-confirm-modal-btn gbr-confirm-modal-btn-cancel">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="gbr-confirm-modal-btn gbr-confirm-modal-btn-delete">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
