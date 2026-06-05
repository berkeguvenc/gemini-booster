/*
 * Copyright (C) 2026 Yağız Berke Güvenç
 *
 * This file is part of gemini-booster.
 *
 * gemini-booster is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * gemini-booster is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gemini-booster. If not, see <https://www.gnu.org/licenses/>.
 */

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
      <span className="side-nav-text">{label}</span>
    </button>
  )
}

export default SidebarButton
