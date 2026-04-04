// contents/gemini-modal.tsx
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import cssText from "data-text:~style.css"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

const GeminiModal = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // 1. Tema dinleyici
    const checkTheme = () =>
      setIsDark(document.body.classList.contains("dark-theme"))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    })

    // 2. Sidebar'dan gelen "Açıl" sinyalini dinle
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent
      setActiveModal(customEvent.detail)
    }
    window.addEventListener("OPEN_GEMINI_MODAL", handleOpenModal)

    return () => {
      observer.disconnect()
      window.removeEventListener("OPEN_GEMINI_MODAL", handleOpenModal)
    }
  }, [])

  if (!activeModal) return null

  const modalTitles = {
    favorites: "Favorite Answers",
    notes: "My Notes",
    prompts: "Prompt Library"
  }

  return (
    <div className={`modal-overlay ${isDark ? "dark" : ""}`}>
      <div className="modal-clickaway" onClick={() => setActiveModal(null)}></div>

      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">
            {modalTitles[activeModal as keyof typeof modalTitles]}
          </h2>
          <button onClick={() => setActiveModal(null)} className="modal-close-btn">
            <span className="google-symbols">close</span>
          </button>
        </div>

        <div className="modal-content">
          <span className="google-symbols modal-icon-placeholder">
            construction
          </span>
          <p className="modal-desc">
            {modalTitles[activeModal as keyof typeof modalTitles]} içerikleri
            yakında eklenecek...
          </p>
        </div>
      </div>
    </div>
  )
}
export default GeminiModal
