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

// contents/gemini-sidebar.tsx
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList } from "plasmo"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import "../i18n"

import SidebarButton from "../components/sidebar/SidebarButton"
import SidebarCollapsedButton from "../components/sidebar/SidebarCollapsedButton"
import { initLanguageSync } from "../utils/language"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const elements = document.querySelectorAll('[data-test-id="my-stuff-side-nav-entry-button"]')
  return Array.from(elements).map((element) => ({
    element,
    insertPosition: "afterend"
  }))
}

const GeminiSidebar = () => {
  const { t, i18n } = useTranslation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const cleanup = initLanguageSync(i18n)
    return cleanup
  }, [i18n])

  useEffect(() => {
    if (document.getElementById("gbr-sidebar-global-style")) return
    const style = document.createElement("style")
    style.id = "gbr-sidebar-global-style"
    style.textContent = `
      bard-sidenav.collapsed,
      bard-sidenav.collapsed side-navigation-content,
      bard-sidenav.collapsed .sidenav-with-history-container,
      bard-sidenav.collapsed .overflow-container,
      bard-sidenav.collapsed mat-nav-list,
      bard-sidenav.collapsed gem-nav-list-item,
      bard-sidenav.collapsed .icon-button-badge-container,
      bard-sidenav.collapsed plasmo-csui {
        overflow: visible !important;
      }
    `
    document.head.appendChild(style)
  }, [])

  useEffect(() => {
    let observer: MutationObserver | null = null

    const initObserver = () => {
      const sidenav = document.querySelector("bard-sidenav")
      if (!sidenav) {
        setTimeout(initObserver, 200)
        return
      }

      setIsCollapsed(sidenav.classList.contains("collapsed"))

      observer = new MutationObserver(() => {
        setIsCollapsed(sidenav.classList.contains("collapsed"))
      })

      observer.observe(sidenav, {
        attributes: true,
        attributeFilter: ["class"]
      })
    }

    initObserver()

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  // Dispatch a global event to open the modal
  const openModal = (type: string) => {
    window.dispatchEvent(new CustomEvent("OPEN_GEMINI_MODAL", { detail: type }))
  }

  if (isCollapsed) {
    return (
      <div className="gemini-sidebar-container collapsed">
        <div className="sidebar-collapsed-btn-group">
          <SidebarCollapsedButton
            icon="folder"
            label={t("chatFolders")}
            onClick={() => openModal("folders")}
          />
          <SidebarCollapsedButton
            icon="star"
            label={t("favoriteAnswers")}
            onClick={() => openModal("favorites")}
          />
          <SidebarCollapsedButton
            icon="bookmark"
            label={t("promptLibrary")}
            onClick={() => openModal("prompts")}
          />
          <SidebarCollapsedButton
            icon="note_stack"
            label={t("myNotes")}
            onClick={() => openModal("notes")}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="gemini-sidebar-container">
      <div>
        <div className="sidebar-btn-group">
          <SidebarButton
            icon="folder"
            label={t("chatFolders")}
            onClick={() => openModal("folders")}
          />
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
