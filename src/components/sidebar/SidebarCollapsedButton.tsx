// components/SidebarCollapsedButton.tsx
import React from "react"

interface SidebarCollapsedButtonProps {
  icon: string
  label: string
  onClick: () => void
}

const SidebarCollapsedButton: React.FC<SidebarCollapsedButtonProps> = ({
  icon,
  label,
  onClick
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onClick()
  }

  return (
    <div className="side-nav-collapsed-btn-wrapper">
      <button
        onClick={handleClick}
        className="side-nav-collapsed-btn"
        aria-label={label}
      >
        <span className="google-symbols side-nav-icon icon-gray">{icon}</span>
      </button>

      <div className="gbr-collapsed-tooltip">
        <div>
          <div
            className="mdc-tooltip mat-mdc-tooltip"
            style={{ transformOrigin: "left center" }}
          >
            <div className="mat-mdc-tooltip-surface">
              {label}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SidebarCollapsedButton
