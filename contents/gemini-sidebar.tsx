import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element:
    document.querySelector(
      '.side-nav-entry-container:has([data-test-id="my-stuff-side-nav-entry-button"])'
    ) ||
    document.querySelector('[data-test-id="my-stuff-side-nav-entry-button"]')
      ?.parentElement,
  insertPosition: "afterend"
})

const GeminiSidebar = () => {
  // Modalı açmak için Global bir Event fırlatıyoruz
  const openModal = (type: string) => {
    window.dispatchEvent(new CustomEvent("OPEN_GEMINI_MODAL", { detail: type }))
  }

  return (
    <div className="gemini-sidebar-container">
      <div className="gemini-sidebar-content">
        <div className="sidebar-btn-group">
          <button
            onClick={() => openModal("favorites")}
            className="side-nav-btn">
            <span className="side-nav-icon icon-amber">⭐</span>
            <span className="gds-label-l">Favori Cevaplar</span>
          </button>

          <button onClick={() => openModal("prompts")} className="side-nav-btn">
            <span className="side-nav-icon icon-gray">📚</span>
            <span className="gds-label-l">İstem Kütüphanesi</span>
          </button>

          <button onClick={() => openModal("notes")} className="side-nav-btn">
            <span className="side-nav-icon icon-blue">📝</span>
            <span className="gds-label-l">My Notes</span>
          </button>
        </div>
      </div>
    </div>
  )
}
export default GeminiSidebar
