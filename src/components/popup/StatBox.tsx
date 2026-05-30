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
