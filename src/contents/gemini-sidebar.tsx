import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import "../i18n"
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
    chrome.storage.sync.get("gbr_settings_language", (res) => {
      if (res.gbr_settings_language) i18n.changeLanguage(res.gbr_settings_language)
    })
    const listener = (changes: any, ns: string) => {
      if (ns === "sync" && changes.gbr_settings_language) {
        i18n.changeLanguage(changes.gbr_settings_language.newValue)
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [i18n])

  // Modalı açmak için Global bir Event fırlatıyoruz
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
