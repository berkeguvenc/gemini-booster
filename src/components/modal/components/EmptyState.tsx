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
