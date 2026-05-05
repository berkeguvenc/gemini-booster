// components/SidebarButton.tsx
import React from "react"

interface SidebarButtonProps {
  icon: string
  label: string
  onClick: () => void
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ icon, label, onClick }) => {
  return (
    <button onClick={onClick} className="side-nav-btn">
      <span className="google-symbols side-nav-icon icon-gray">{icon}</span>
      <span className="gds-label-l">{label}</span>
    </button>
  )
}

export default SidebarButton
