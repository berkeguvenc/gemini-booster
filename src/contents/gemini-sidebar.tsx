// contents/gemini-sidebar.tsx
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import "../i18n"
import { initLanguageSync } from "../utils/language"
import SidebarButton from "../components/SidebarButton"

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
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const cleanup = initLanguageSync(i18n)
    return cleanup
  }, [i18n])

  // Dispatch a global event to open the modal
  const openModal = (type: string) => {
    window.dispatchEvent(new CustomEvent("OPEN_GEMINI_MODAL", { detail: type }))
  }

  return (
    <div className="gemini-sidebar-container">
      <div className="gemini-sidebar-content">
        <div className="sidebar-btn-group">
          <SidebarButton
            icon="star"
            label={t("favoriteAnswers")}
            onClick={() => openModal("favorites")}
          />
          <SidebarButton
            icon="folder"
            label={t("chatFolders")}
            onClick={() => openModal("folders")}
          />
          <SidebarButton
            icon="bookmark"
            label={t("promptLibrary")}
            onClick={() => openModal("prompts")}
          />
          <SidebarButton
            icon="note_stack"
            label={t("myNotes")}
            onClick={() => openModal("notes")}
          />
        </div>
      </div>
    </div>
  )
}

export default GeminiSidebar
