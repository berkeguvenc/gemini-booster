import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import "./i18n"
import ConfirmModal from "./components/ConfirmModal"
import AlertModal from "./components/AlertModal"
import StatBox from "./components/StatBox"
import SearchResultItem from "./components/SearchResultItem"
import { BookmarkIcon, StarIcon, DocumentIcon } from "./components/Icons"

function IndexPopup() {
  const { t, i18n } = useTranslation()
  const [currentLang, setCurrentLang] = useState<string>("tr")
  const [prompts, setPrompts] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [bulkDeleteEnabled, setBulkDeleteEnabled] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Custom Modals State
  const [alertMessage, setAlertMessage] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    // Verileri chrome.storage'dan çek
    chrome.storage.local.get(["gemini_prompts", "gemini_favorites", "gemini_notes"], (localResult) => {
      chrome.storage.sync.get(["gbr_settings_bulk_delete", "gbr_settings_language"], (syncResult) => {
        setPrompts(localResult.gemini_prompts || [])
        setFavorites(localResult.gemini_favorites || [])
        setNotes(localResult.gemini_notes || [])
        if (syncResult.gbr_settings_bulk_delete !== undefined) {
          setBulkDeleteEnabled(syncResult.gbr_settings_bulk_delete)
        }
        
        // Language handling
        let savedLang = syncResult.gbr_settings_language
        if (!savedLang) {
          const sysLang = typeof chrome !== "undefined" && chrome.i18n ? chrome.i18n.getUILanguage() : navigator.language
          savedLang = sysLang.startsWith("tr") ? "tr" : "en"
        }
        setCurrentLang(savedLang)
        i18n.changeLanguage(savedLang)
      })
    })
  }, [i18n])

  const handleExport = () => {
    chrome.storage.local.get(["gemini_prompts", "gemini_favorites", "gemini_notes"], (result) => {
      const exportData = {
        prompts: result.gemini_prompts || [],
        favorites: result.gemini_favorites || [],
        notes: result.gemini_notes || []
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json"
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `enhancer_for_gemini_backup_${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string)
        
        // Basit format doğrulama
        if (typeof jsonData !== 'object' || Array.isArray(jsonData)) {
          setAlertMessage(t("importFormatError"))
          return
        }

        const newPrompts = Array.isArray(jsonData.prompts) ? jsonData.prompts : []
        const newFavorites = Array.isArray(jsonData.favorites) ? jsonData.favorites : []
        const newNotes = Array.isArray(jsonData.notes) ? jsonData.notes : []

        chrome.storage.local.set({
          gemini_prompts: newPrompts,
          gemini_favorites: newFavorites,
          gemini_notes: newNotes
        }, () => {
          setAlertMessage(t("importSuccess"))
          setPrompts(newPrompts)
          setFavorites(newFavorites)
          setNotes(newNotes)
        })
      } catch (error) {
        setAlertMessage(t("importReadError"))
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const toggleBulkDelete = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked
    setBulkDeleteEnabled(val)
    chrome.storage.sync.set({ gbr_settings_bulk_delete: val })
  }

  const handleClearAllClick = () => {
    setShowConfirm(true)
  }

  const executeClearAll = () => {
    setShowConfirm(false)
    chrome.storage.local.remove(["gemini_prompts", "gemini_favorites", "gemini_notes"], () => {
      setPrompts([])
      setFavorites([])
      setNotes([])
      setAlertMessage(t("clearedSuccess"))
    })
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value
    setCurrentLang(lang)
    i18n.changeLanguage(lang)
    chrome.storage.sync.set({ gbr_settings_language: lang })
  }

  const filteredPrompts = prompts.filter((p) => p.text?.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredFavorites = favorites.filter((f) => f.text?.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredNotes = notes.filter((n) => n.text?.toLowerCase().includes(searchQuery.toLowerCase()))
  const isSearching = searchQuery.trim().length > 0

  return (
    <>
      <style>{`
        /* Popup çevresindeki beyaz kenarlığı kaldırmak için body margin/padding sıfırlanır */
        body {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #1e1e24;
          overflow-x: hidden;
        }
        * {
          box-sizing: border-box;
        }
        /* Özel Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1e1e24; 
        }
        ::-webkit-scrollbar-thumb {
          background: #444; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555; 
        }
      `}</style>

      <div
        style={{
          width: 320,
          padding: "20px",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          backgroundColor: "#1e1e24",
          color: "#ffffff"
        }}>
        
        {/* Başlık */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            borderBottom: "1px solid #333",
            paddingBottom: "12px"
          }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "22px" }}>🚀</span> {t("appTitle")}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <select
              value={currentLang}
              onChange={handleLanguageChange}
              style={{
                backgroundColor: "#2a2a32",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "4px",
                padding: "2px 4px",
                fontSize: "12px",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="en">EN</option>
              <option value="tr">TR</option>
            </select>
            <span style={{ fontSize: "12px", color: "#888", backgroundColor: "#2a2a32", padding: "2px 6px", borderRadius: "4px" }}>
              v1.0
            </span>
          </div>
        </div>

        {/* Arama Çubuğu */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #444",
              backgroundColor: "#25252d",
              color: "#fff",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>

        {/* Arama Modu - Sonuçlar */}
        {isSearching ? (
          <div style={{ maxHeight: "350px", overflowY: "auto", paddingRight: "4px" }}>
            
            {/* İstem Sonuçları */}
            {filteredPrompts.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#aaa", fontSize: "12px", textTransform: "uppercase" }}>{t("prompts")} ({filteredPrompts.length})</h4>
                {filteredPrompts.map((p) => (
                  <SearchResultItem
                    key={p.id}
                    text={p.text}
                    onCopy={() => handleCopy(p.id, p.text)}
                    isCopied={copiedId === p.id}
                    copyText={t("copy")}
                    copiedText={t("copied")}
                  />
                ))}
              </div>
            )}

            {/* Favori Sonuçları */}
            {filteredFavorites.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#aaa", fontSize: "12px", textTransform: "uppercase" }}>{t("favorites")} ({filteredFavorites.length})</h4>
                {filteredFavorites.map((f) => (
                  <SearchResultItem
                    key={f.id}
                    text={f.text}
                    onCopy={() => handleCopy(f.id, f.text)}
                    isCopied={copiedId === f.id}
                    copyText={t("copy")}
                    copiedText={t("copied")}
                  />
                ))}
              </div>
            )}

            {/* Not Sonuçları */}
            {filteredNotes.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#aaa", fontSize: "12px", textTransform: "uppercase" }}>{t("notes")} ({filteredNotes.length})</h4>
                {filteredNotes.map((n) => (
                  <SearchResultItem
                    key={n.id}
                    text={n.text}
                    onCopy={() => handleCopy(n.id, n.text)}
                    isCopied={copiedId === n.id}
                    copyText={t("copy")}
                    copiedText={t("copied")}
                  />
                ))}
              </div>
            )}

            {filteredPrompts.length === 0 && filteredFavorites.length === 0 && filteredNotes.length === 0 && (
              <div style={{ textAlign: "center", color: "#888", fontSize: "13px", padding: "20px 0" }}>
                {t("noResults")}
              </div>
            )}
          </div>
        ) : (
          /* Normal Mod - Ana Ekran */
          <>
            {/* İstatistikler */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px",
                marginBottom: "20px"
              }}>
              <StatBox icon={<BookmarkIcon size={24} />} value={prompts.length} label={t("prompts")} />
              <StatBox icon={<StarIcon size={24} />} value={favorites.length} label={t("favorites")} />
              <StatBox icon={<DocumentIcon size={24} />} value={notes.length} label={t("notes")} />
            </div>

            {/* Veri Yönetimi */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={sectionTitleStyle}>{t("dataManagement")}</h3>
              
              <div style={dataSectionStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>{t("allData")}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "12px", lineHeight: "1.4" }}>
                  {t("allDataDesc")}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={btnStyle} onClick={handleExport}>
                    {t("export")}
                  </button>
                  <label style={{ ...btnStyle, background: "#2a2a32", color: "#fff", border: "1px solid #444" }}>
                    {t("import")}
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={handleImport}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Ayarlar */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={sectionTitleStyle}>{t("settings")}</h3>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  cursor: "pointer",
                  background: "#25252d",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #333"
                }}>
                <span>{t("bulkDeleteShow")}</span>
                <input
                  type="checkbox"
                  checked={bulkDeleteEnabled}
                  onChange={toggleBulkDelete}
                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#6c5ce7" }}
                />
              </label>
            </div>

            {/* Tehlikeli Bölge */}
            <div style={{ marginTop: "20px", borderTop: "1px solid #333", paddingTop: "16px", textAlign: "center" }}>
              <button
                onClick={handleClearAllClick}
                style={{
                  background: "transparent",
                  color: "#ff7675",
                  border: "none",
                  fontSize: "13px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: "4px 8px"
                }}>
                {t("clearAllData")}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmModal
          title={t("clearDataTitle")}
          description={t("clearDataDesc")}
          onConfirm={executeClearAll}
          onCancel={() => setShowConfirm(false)}
          confirmText={t("yesDelete")}
          cancelText={t("cancel")}
        />
      )}

      {/* Alert Modal */}
      {alertMessage && (
        <AlertModal
          title={t("info")}
          message={alertMessage}
          onClose={() => setAlertMessage("")}
          closeText={t("ok")}
        />
      )}
    </>
  )
}

// Ortak Stiller
const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 12px 0",
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#888"
}

const dataSectionStyle: React.CSSProperties = {
  backgroundColor: "#25252d",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "10px",
  border: "1px solid #333"
}

const btnStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px 0",
  textAlign: "center",
  backgroundColor: "#6c5ce7",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "opacity 0.2s",
  display: "inline-block"
}

export default IndexPopup
