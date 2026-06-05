/*
 * Copyright (C) 2026 Yağız Berke Güvenç
 *
 * This file is part of gemini-booster.
 *
 * gemini-booster is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * gemini-booster is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gemini-booster. If not, see <https://www.gnu.org/licenses/>.
 */

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
