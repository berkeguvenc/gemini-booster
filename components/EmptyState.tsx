// components/EmptyState.tsx
import React from "react"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  return (
    <div className="favorites-empty">
      <span
        style={{ color: "var(--gem-sys-color--on-surface-variant)" }}
        className="modal-icon-placeholder"
      >
        {icon}
      </span>
      <p className="modal-desc">{title}</p>
      {description && <p className="modal-desc-sub">{description}</p>}
    </div>
  )
}

export default EmptyState
