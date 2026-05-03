import { useState, useEffect } from "react"

function IndexPopup() {
  const [prompts, setPrompts] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [bulkDeleteEnabled, setBulkDeleteEnabled] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    // Verileri chrome.storage'dan çek
    chrome.storage.sync.get(
      ["gemini_prompts", "gemini_favorites", "gbr_settings_bulk_delete"],
      (result) => {
        setPrompts(result.gemini_prompts || [])
        setFavorites(result.gemini_favorites || [])
        if (result.gbr_settings_bulk_delete !== undefined) {
          setBulkDeleteEnabled(result.gbr_settings_bulk_delete)
        }
      }
    )
  }, [])

  const handleExport = (type: "prompts" | "favorites") => {
    const key = type === "prompts" ? "gemini_prompts" : "gemini_favorites"
    chrome.storage.sync.get(key, (result) => {
      const data = result[key] || []
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `gemini_${type}_backup_${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const handleImport = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "prompts" | "favorites"
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string)
        if (!Array.isArray(jsonData)) {
          alert("Hatalı dosya formatı! Lütfen geçerli bir JSON dizisi yükleyin.")
          return
        }
        const key = type === "prompts" ? "gemini_prompts" : "gemini_favorites"

        chrome.storage.sync.set({ [key]: jsonData }, () => {
          alert("Veriler başarıyla içe aktarıldı!")
          if (type === "prompts") setPrompts(jsonData)
          if (type === "favorites") setFavorites(jsonData)
        })
      } catch (error) {
        alert("Dosya okunamadı. Geçerli bir JSON dosyası olduğundan emin olun.")
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

  const handleClearAll = () => {
    const confirmDelete = window.confirm(
      "Tüm istemleri ve favori cevapları silmek istediğinize emin misiniz? Bu işlem geri alınamaz!"
    )
    if (confirmDelete) {
      chrome.storage.sync.remove(["gemini_prompts", "gemini_favorites"], () => {
        setPrompts([])
        setFavorites([])
        alert("Tüm veriler temizlendi.")
      })
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const filteredPrompts = prompts.filter((p) => p.text?.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredFavorites = favorites.filter((f) => f.text?.toLowerCase().includes(searchQuery.toLowerCase()))
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
            <span style={{ fontSize: "22px" }}>🚀</span> Gemini Booster
          </h2>
          <span style={{ fontSize: "12px", color: "#888", backgroundColor: "#2a2a32", padding: "2px 6px", borderRadius: "4px" }}>
            v1.0
          </span>
        </div>

        {/* Arama Çubuğu */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="İstemlerde ve Favorilerde Ara..."
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
                <h4 style={{ margin: "0 0 8px 0", color: "#aaa", fontSize: "12px", textTransform: "uppercase" }}>İstemler ({filteredPrompts.length})</h4>
                {filteredPrompts.map((p) => (
                  <div key={p.id} style={searchResultStyle}>
                    <div style={searchResultTextStyle}>{p.text}</div>
                    <button onClick={() => handleCopy(p.id, p.text)} style={copyBtnStyle(copiedId === p.id)}>
                      {copiedId === p.id ? "✓" : "Kopyala"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Favori Sonuçları */}
            {filteredFavorites.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#aaa", fontSize: "12px", textTransform: "uppercase" }}>Favoriler ({filteredFavorites.length})</h4>
                {filteredFavorites.map((f) => (
                  <div key={f.id} style={searchResultStyle}>
                    <div style={searchResultTextStyle}>{f.text}</div>
                    <button onClick={() => handleCopy(f.id, f.text)} style={copyBtnStyle(copiedId === f.id)}>
                      {copiedId === f.id ? "✓" : "Kopyala"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {filteredPrompts.length === 0 && filteredFavorites.length === 0 && (
              <div style={{ textAlign: "center", color: "#888", fontSize: "13px", padding: "20px 0" }}>
                Sonuç bulunamadı.
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
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "20px"
              }}>
              <div style={statBoxStyle}>
                <div style={statIconStyle}>📝</div>
                <div style={statValueStyle}>{prompts.length}</div>
                <div style={statLabelStyle}>İstemler</div>
              </div>
              <div style={statBoxStyle}>
                <div style={statIconStyle}>⭐</div>
                <div style={statValueStyle}>{favorites.length}</div>
                <div style={statLabelStyle}>Favoriler</div>
              </div>
            </div>

            {/* Veri Yönetimi */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={sectionTitleStyle}>Veri Yönetimi</h3>
              
              <div style={dataSectionStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>İstem Kütüphanesi</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={btnStyle} onClick={() => handleExport("prompts")}>
                    Dışa Aktar
                  </button>
                  <label style={{ ...btnStyle, background: "#2a2a32", color: "#fff", border: "1px solid #444" }}>
                    İçe Aktar
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={(e) => handleImport(e, "prompts")}
                    />
                  </label>
                </div>
              </div>

              <div style={dataSectionStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>Favori Cevaplar</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={btnStyle} onClick={() => handleExport("favorites")}>
                    Dışa Aktar
                  </button>
                  <label style={{ ...btnStyle, background: "#2a2a32", color: "#fff", border: "1px solid #444" }}>
                    İçe Aktar
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={(e) => handleImport(e, "favorites")}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Ayarlar */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={sectionTitleStyle}>Ayarlar</h3>
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
                <span>Toplu Silme Butonu Göster</span>
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
                onClick={handleClearAll}
                style={{
                  background: "transparent",
                  color: "#ff7675",
                  border: "none",
                  fontSize: "13px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: "4px 8px"
                }}>
                Tüm Verileri Temizle
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// Ortak Stiller
const statBoxStyle: React.CSSProperties = {
  backgroundColor: "#25252d",
  borderRadius: "8px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  border: "1px solid #333"
}

const statIconStyle: React.CSSProperties = {
  fontSize: "20px",
  marginBottom: "4px"
}

const statValueStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#6c5ce7"
}

const statLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#aaa"
}

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

const searchResultStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#25252d",
  padding: "10px",
  borderRadius: "6px",
  marginBottom: "8px",
  border: "1px solid #333",
  gap: "8px"
}

const searchResultTextStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#ccc",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  flex: 1
}

const copyBtnStyle = (copied: boolean): React.CSSProperties => ({
  background: copied ? "#00b894" : "#444",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  padding: "4px 8px",
  fontSize: "11px",
  cursor: "pointer",
  minWidth: "60px",
  transition: "background 0.2s"
})

export default IndexPopup
