// components/AlertModal.tsx
import React from "react"
import ConfirmModal from "./ConfirmModal"

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
    <ConfirmModal
      title={title}
      description={message}
      onConfirm={onClose}
      confirmText={closeText}
      variant="primary"
    />
  )
}

export default AlertModal
