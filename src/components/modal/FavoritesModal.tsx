// components/FavoritesModal.tsx — Favorites tab content for the main modal
import React from "react"
import { useTranslation } from "react-i18next"

import type { FavoriteAnswer } from "../../types/favorite"
import EmptyState from "./components/EmptyState"
import { StarIcon } from "../Icons"
import ListItem from "./components/ListItem"

interface FavoritesModalProps {
  favorites: FavoriteAnswer[]
  filteredFavorites: FavoriteAnswer[]
  copiedIds: Record<string, boolean>
  onCopy: (id: string, text: string) => Promise<void>
  onDelete: (id: string) => void
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  favorites,
  filteredFavorites,
  copiedIds,
  onCopy,
  onDelete
}) => {
  const { t } = useTranslation()

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={<StarIcon size={40} />}
        title={t("noFavorites")}
        description={t("noFavoritesDesc")}
      />
    )
  }

  if (filteredFavorites.length === 0) {
    return (
      <div className="favorites-empty">
        <p className="modal-desc">{t("noFavoritesMatch")}</p>
      </div>
    )
  }

  return (
    <ul className="item-list">
      {filteredFavorites.map((fav) => (
        <ListItem
          key={fav.id}
          id={fav.id}
          text={fav.text}
          timestamp={fav.savedAt}
          url={fav.url}
          icon={<StarIcon size={24} />}
          iconColorClass="star"
          onCopy={onCopy}
          onDelete={onDelete}
          isCopied={!!copiedIds[fav.id]}
        />
      ))}
    </ul>
  )
}

export default FavoritesModal
