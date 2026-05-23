// components/SidebarButton.tsx
import React from "react"

interface SidebarButtonProps {
  icon: string
  label: string
  onClick: () => void
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ icon, label, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onClick()
  }

  return (
    <button onClick={handleClick} className="side-nav-btn" title={label}>
      <span className="google-symbols side-nav-icon icon-gray">{icon}</span>
      <span className="title-text gds-body-s">{label}</span>
    </button>
  )
}

export default SidebarButton
