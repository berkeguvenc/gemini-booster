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
  element: document.querySelector(
    'conversations-list[data-test-id="all-conversations"] .title-container'
  ),
  insertPosition: "beforebegin"
})

const GeminiSidebar = () => {
  // Modalı açmak için Global bir Event fırlatıyoruz
  const openModal = (type: string) => {
    window.dispatchEvent(new CustomEvent("OPEN_GEMINI_MODAL", { detail: type }))
  }

  return (
    <div className="gemini-sidebar-container">
      <div className="gemini-sidebar-content">
        <hr className="gemini-hr" />

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

        <hr className="gemini-hr" />
      </div>
    </div>
  )
}
export default GeminiSidebar
