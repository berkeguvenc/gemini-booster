import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
    .google-symbols {
      font-family: 'Material Symbols Outlined', sans-serif !important;
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
    }
    ${cssText}
  `
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element: document.querySelector(
    'conversations-list[data-test-id="all-conversations"]'
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
            <span className="side-nav-icon icon-amber">
              ⭐
            </span>
            <span className="gds-label-l">Favorite Answers</span>
          </button>

          <button onClick={() => openModal("notes")} className="side-nav-btn">
            <span className="side-nav-icon icon-blue">
              📝
            </span>
            <span className="gds-label-l">My Notes</span>
          </button>

          <button onClick={() => openModal("prompts")} className="side-nav-btn">
            <span className="side-nav-icon icon-gray">
              📚
            </span>
            <span className="gds-label-l">Prompt Library</span>
          </button>
        </div>

      </div>
    </div>
  )
}
export default GeminiSidebar
