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

// components/StatBox.tsx
import React from "react"

interface StatBoxProps {
  icon: string | React.ReactNode
  value: string | number
  label: string
}

const StatBox: React.FC<StatBoxProps> = ({ icon, value, label }) => {
  return (
    <div style={statBoxStyle}>
      <div style={statIconStyle}>{icon}</div>
      <div style={statValueStyle}>{value}</div>
      <div style={statLabelStyle}>{label}</div>
    </div>
  )
}

const statBoxStyle: React.CSSProperties = {
  backgroundColor: "#1e1f20",
  borderRadius: "10px",
  padding: "8px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  textAlign: "center"
}

const statIconStyle: React.CSSProperties = {
  fontSize: "18px",
  marginBottom: "2px",
  color: "#e8eaed"
}

const statValueStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#4285f4"
}

const statLabelStyle: React.CSSProperties = {
  fontSize: "10px",
  color: "#aaa",
  lineHeight: "1.1",
  marginTop: "2px"
}

export default StatBox
