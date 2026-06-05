/*
 * Copyright (C) 2026 Yağız Berke Güvenç
 *
 * This file is part of gemini-booster.
 *
 * gemini-booster is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * gemini-booster is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with gemini-booster. If not, see <https://www.gnu.org/licenses/>.
 */

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
