// contents/gemini-sidebar.tsx
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
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
          <button onClick={() => openModal("favorites")} className="side-nav-btn">
            <span className="google-symbols side-nav-icon icon-amber">star</span>
            <span className="gds-label-l">Favorite Answers</span>
          </button>

          <button onClick={() => openModal("notes")} className="side-nav-btn">
            <span className="google-symbols side-nav-icon icon-blue">assignment</span>
            <span className="gds-label-l">My Notes</span>
          </button>

          <button onClick={() => openModal("prompts")} className="side-nav-btn">
            <span className="google-symbols side-nav-icon icon-gray">library_books</span>
            <span className="gds-label-l">Prompt Library</span>
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search folders & chats..."
          />
        </div>

        <div className="folders-header">
          <span>Folders</span>
          <button className="add-btn">
            <span className="google-symbols side-nav-icon">add</span>
          </button>
        </div>

        <hr className="gemini-hr" />
      </div>
    </div>
  )
}
export default GeminiSidebar
