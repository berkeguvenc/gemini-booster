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
    <button onClick={handleClick} className="side-nav-collapsed-btn" title={label}>
      <span className="google-symbols side-nav-icon icon-gray">{icon}</span>
    </button>
  )
}

export default SidebarCollapsedButton
