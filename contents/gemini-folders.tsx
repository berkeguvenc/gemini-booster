import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import type { ChatItem, Folder } from "~types/folder"

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

// ----------------------------------------------------
// UI ENJEKSİYONU (Gölge DOM YERİNE NATIVE DOM KULLANIMI)
// ----------------------------------------------------
export const getRootContainer = () => {
  return new Promise<HTMLElement>((resolve) => {
    const checkInterval = setInterval(() => {
      // Sohbetlerin listelendiği container'ı bul
      const listContainer = document.querySelector(
        ".conversations-container[id^='conversations-list-']"
      )
      // Ayrıca başlık alanını bul ("Sohbetler")
      const titleContainer = document.querySelector(
        "conversations-list .title-container"
      )

      const csuiNodes = document.querySelectorAll("plasmo-csui")
      for (const csui of Array.from(csuiNodes)) {
        if (csui.shadowRoot) {
          const foldersHeader = csui.shadowRoot.querySelector(".folders-header")
          if (foldersHeader) {
            // Hedef bulundu, tam olarak sidebar'ın içine (Folders Header altına) konumlanıyoruz!
            clearInterval(checkInterval)

            const foldersRoot = document.createElement("div")
            foldersRoot.id = "gbr-folders-root"
            foldersRoot.style.width = "100%"
            foldersHeader.parentNode?.insertBefore(
              foldersRoot,
              foldersHeader.nextSibling
            )

            // Ortak CSS'i Light DOM'a bas (Checkbox'lar, Ghost Wrap için)
            injectGlobalStyles(document.head)

            // Ayrıca CSS'i Shadow DOM'a bas (Klasör görünümleri için)
            injectGlobalStyles(csui.shadowRoot)

            resolve(foldersRoot)
            return
          }
        }
      }
    }, 500)
  })
}

// ----------------------------------------------------
// STORAGE YÖNETİMİ
// ----------------------------------------------------
async function getStorageData() {
  return new Promise<{
    folders: Folder[]
    chatMap: Record<string, string>
    chatData: Record<string, ChatItem>
  }>((resolve) => {
    chrome.storage.local.get(
      ["gemini_folders", "gemini_chatMap", "gemini_chatData"],
      (res) => {
        resolve({
          folders: res.gemini_folders || [],
          chatMap: res.gemini_chatMap || {},
          chatData: res.gemini_chatData || {}
        })
      }
    )
  })
}

async function saveStorageData(
  folders: Folder[],
  chatMap: Record<string, string>,
  chatData: Record<string, ChatItem>
) {
  return new Promise<void>((resolve) => {
    chrome.storage.local.set(
      {
        gemini_folders: folders,
        gemini_chatMap: chatMap,
        gemini_chatData: chatData
      },
      resolve
    )
  })
}

// ----------------------------------------------------
// GLOBAL STİLLER
// ----------------------------------------------------
function injectGlobalStyles(targetDOM: Node) {
  // Zaten eklenmişse tekrar ekleme
  const rootNode = targetDOM.getRootNode() as Document | ShadowRoot
  if (rootNode.querySelector && rootNode.querySelector("#gbr-folders-style"))
    return

  const style = document.createElement("style")
  style.id = "gbr-folders-style"
  style.textContent = `
    /* Ghost Wrapping: Bir klasöre atanmış sohbetleri native listede gizle */
    .gbr-hidden-chat {
      display: none !important;
    }

    /* Toplu Seçim Checkbox Göstergesi */
    .gbr-bulk-mode-active .conversation-items-container .trailing-icon-container {
      display: none !important;
    }
    
    /* Checkbox overlay behavior without squeezing */
    .conversation-items-container {
      position: relative;
    }
    .gbr-bulk-mode-active .conversation-items-container a.conversation {
      padding-left: 32px !important;
      transition: padding 0.2s;
    }
    
    .gbr-bulk-checkbox {
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      margin: 0 !important;
      z-index: 10; /* Sohbet butonunun üzerinde kalması için */
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: var(--gem-sys-color--primary, #a8c7fa);
    }

    /* Tree UI Stilleri */
    .gbr-folder-group {
      display: flex;
      flex-direction: column;
    }
    .gbr-folder-header {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 8px;
      color: var(--gem-sys-color--on-surface, #e3e3e3);
      font-weight: 500;
      transition: background-color 0.2s;
      user-select: none;
    }
    .gbr-folder-header:hover {
      background-color: var(--gem-sys-color--surface-container-highest, rgba(255, 255, 255, 0.08));
    }
    .gbr-folder-icon {
      font-size: 20px;
      margin-right: 12px;
    }
    .gbr-folder-title {
      flex: 1;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gbr-folder-content {
      position: relative;
      padding-left: 26px; /* Alt elemanları kaydır */
      display: flex;
      flex-direction: column;
    }
    /* Klasör hiyerarşi çizgisi (Ağaç yapısı) */
    .gbr-folder-content::before {
      content: "";
      position: absolute;
      left: 25px; /* İkonun tam ortasına denk gelir (16px padding + 9px offset) */
      top: 0;
      bottom: 0px;
      width: 1px;
      background-color: rgba(255, 255, 255, 0.1);
    }
    /* Klasör içindeki item (Sohbet) düzenlemesi */
    .gbr-folder-item {
      position: relative;
      margin-left: 8px; /* Çizgiden 약간 saga */
    }
    
    /* Drag and Drop Etkileşimi */
    .gbr-dragging {
      opacity: 0.5;
      background-color: rgba(168, 199, 250, 0.1);
    }
    .gbr-drag-over {
      background-color: rgba(168, 199, 250, 0.2) !important;
      outline: 2px dashed var(--gem-sys-color--primary, #a8c7fa);
    }

    /* Toplu İşlem Alt Barı */
    .gbr-action-bar {
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: var(--gem-sys-color--surface-container-high, #282a2c);
      border-radius: 12px;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      color: var(--gem-sys-color--on-surface, #e3e3e3);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .gbr-action-buttons {
      display: flex;
      gap: 12px;
    }
    .gbr-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: background 0.2s;
    }
    .gbr-btn-danger {
      background-color: #f2b8b5;
      color: #601410;
    }
    .gbr-btn-danger:hover { background-color: #ea868f; }
    .gbr-btn-primary {
      background-color: var(--gem-sys-color--primary, #a8c7fa);
      color: #041e49;
    }
    .gbr-btn-primary:hover { filter: brightness(0.9); }
    .gbr-btn-secondary {
      background-color: transparent;
      color: var(--gem-sys-color--on-surface, #e3e3e3);
      border: 1px solid rgba(255,255,255,0.2);
    }
    .gbr-btn-secondary:hover { background-color: rgba(255,255,255,0.05); }

    /* Toplu Seçim Başlık İkonu */
    .gbr-bulk-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--gem-sys-color--on-surface-variant, #c4c7c5);
      cursor: pointer;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      transition: background 0.2s;
      margin-left: 8px;
    }
    .gbr-bulk-toggle .google-symbols {
      font-size: 20px;
    }
    .gbr-bulk-toggle:hover {
      background-color: var(--gem-sys-color--surface-container-highest, rgba(255, 255, 255, 0.08));
    }
    .gbr-bulk-toggle.active {
      color: var(--gem-sys-color--primary, #a8c7fa);
    }
  `
  targetDOM.appendChild(style)
}

// ----------------------------------------------------
// YARDIMCI FONKSİYONLAR
// ----------------------------------------------------
function getChatIdFromEl(el: Element): string | null {
  const link = el.querySelector("a.conversation")
  if (!link) return null
  const href = link.getAttribute("href") || ""
  const match = href.match(/\/app\/([a-z0-9]+)/)
  if (match) return match[1]
  return null
}

function getChatTitleFromEl(el: Element): string {
  const titleEl = el.querySelector(".conversation-title") as HTMLElement
  if (!titleEl) return "İsimsiz Sohbet"
  // .conversation-title-cover gibi iç elementlerin textlerini filtrele
  const clone = titleEl.cloneNode(true) as HTMLElement
  const cover = clone.querySelector(".conversation-title-cover")
  if (cover) cover.remove()
  return clone.textContent?.trim() || "İsimsiz Sohbet"
}

// ----------------------------------------------------
// HEADLESS ENGINE: GHOST WRAPPING & NATIVE DOM MANIPULATION
// Bu bileşen hiçbir görsel UI (React Elementi) oluşturmaz.
// Yalnızca Native Gemini ekranındaki sohbetleri gizler, storage günceller ve checkbox'ları enjekte eder.
// ----------------------------------------------------
const GeminiFoldersApp = () => {
  const [chatMap, setChatMap] = useState<Record<string, string>>({})
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set())

  // Başlangıç verisini al
  useEffect(() => {
    chrome.storage.local.get(["gemini_chatMap"], (res) => {
      setChatMap(res.gemini_chatMap || {})
    })
  }, [])

  // Storage güncellemelerini ve eventleri dinle (Sidebar üzerinden gelen değişiklikler)
  useEffect(() => {
    const handleStorageChange = (changes: any) => {
      if (changes.gemini_chatMap) {
        setChatMap(changes.gemini_chatMap.newValue || {})
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange)

    const handleStateUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail && typeof detail.bulkMode !== "undefined") {
        setBulkMode(detail.bulkMode)
      }
    }
    window.addEventListener("GBR_STATE_UPDATED", handleStateUpdated)

    const handleToggleChat = (e: Event) => {
      const { id, checked } = (e as CustomEvent).detail
      setSelectedChats((prev) => {
        const next = new Set(prev)
        if (checked) next.add(id)
        else next.delete(id)
        return next
      })
    }
    window.addEventListener("GBR_TOGGLE_CHAT", handleToggleChat)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
      window.removeEventListener("GBR_STATE_UPDATED", handleStateUpdated)
      window.removeEventListener("GBR_TOGGLE_CHAT", handleToggleChat)
    }
  }, [])

  // Native DOM Observer: Ghost Wrapping Uygulaması ve Veri Okuma
  useEffect(() => {
    const applyGhostWrapping = () => {
      const chatContainers = document.querySelectorAll(
        ".conversation-items-container"
      )

      let newScrapedData: Record<string, any> = {}
      let hasNewData = false

      chatContainers.forEach((el) => {
        const id = getChatIdFromEl(el)
        if (!id) return

        // Yeni keşfedilen sohbetin verisini yakala ve storage at
        const title = getChatTitleFromEl(el)
        const url = (el.querySelector("a.conversation") as HTMLAnchorElement)
          ?.href
        if (title && url) {
          newScrapedData[id] = { id, title, url }
          hasNewData = true
        }

        // Klasöre aitse native listede gizle
        if (chatMap[id]) {
          el.classList.add("gbr-hidden-chat")
        } else {
          el.classList.remove("gbr-hidden-chat")
        }

        // Sürükle Bırak API'sini başlat (Sadece native elemanlar için)
        const link = el.querySelector("a.conversation") as HTMLElement
        if (link && !el.classList.contains("gbr-hidden-chat")) {
          link.setAttribute("draggable", "true")
          link.ondragstart = (e) => {
            if (e.dataTransfer) {
              e.dataTransfer.setData("text/plain", id)
              el.classList.add("gbr-dragging")
            }
          }
          link.ondragend = () => {
            el.classList.remove("gbr-dragging")
          }
        }
      })

      // Basit bir toplu kayıt sistemi (performans için arka planda direkt depolama)
      if (hasNewData) {
        chrome.storage.local.get(["gemini_chatData"], (res) => {
          const existing = res.gemini_chatData || {}
          let changed = false
          for (const key in newScrapedData) {
            if (
              !existing[key] ||
              existing[key].title !== newScrapedData[key].title
            ) {
              existing[key] = newScrapedData[key]
              changed = true
            }
          }
          if (changed) chrome.storage.local.set({ gemini_chatData: existing })
        })
      }
    }

    applyGhostWrapping()

    const observer = new MutationObserver(() => applyGhostWrapping())
    const listContainer = document.querySelector(
      ".conversations-container[id^='conversations-list-']"
    )
    if (listContainer) {
      observer.observe(listContainer, { childList: true, subtree: true })
    }

    return () => {
      observer.disconnect()
    }
  }, [chatMap])

  // Bulk Mode tetiklendiğinde Native Container'lara Checkbox Enjeksiyonu
  useEffect(() => {
    if (bulkMode) {
      document.body.classList.add("gbr-bulk-mode-active")
    } else {
      document.body.classList.remove("gbr-bulk-mode-active")
      setSelectedChats(new Set())
    }

    const chatContainers = document.querySelectorAll(
      ".conversation-items-container"
    )
    chatContainers.forEach((el) => {
      const id = getChatIdFromEl(el)
      if (!id) return

      let checkbox = el.querySelector(".gbr-bulk-checkbox") as HTMLInputElement
      if (bulkMode) {
        if (!checkbox) {
          checkbox = document.createElement("input")
          checkbox.type = "checkbox"
          checkbox.className = "gbr-bulk-checkbox"
          checkbox.addEventListener("change", (e) => {
            const target = e.target as HTMLInputElement
            window.dispatchEvent(
              new CustomEvent("GBR_TOGGLE_CHAT", {
                detail: { id, checked: target.checked }
              })
            )
          })
          el.insertBefore(checkbox, el.firstChild)
          checkbox.addEventListener("click", (e) => e.stopPropagation())
        }
        checkbox.checked = selectedChats.has(id)
      } else {
        if (checkbox) checkbox.remove()
      }
    })
  }, [bulkMode, selectedChats])

  // Görüntülenecek arayüz yok
  return null
}

export default GeminiFoldersApp
