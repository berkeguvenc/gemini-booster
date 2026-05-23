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
  backgroundColor: "#25252d",
  borderRadius: "8px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  border: "1px solid #333"
}

const statIconStyle: React.CSSProperties = {
  fontSize: "20px",
  marginBottom: "4px"
}

const statValueStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#6c5ce7"
}

const statLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#aaa"
}

export default StatBox
