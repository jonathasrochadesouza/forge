// Single-slot favorite for the pinned web apps, persisted in localStorage — the renderer's
// established store for UI preferences, with no upstream settings surface to extend. Favoriting
// one app replaces the previous favorite; the favorite renders as a standalone sidebar entry
// (ForgeWebAppFavoriteSidebarEntry) without opening the pinned-apps dropdown.
import { useSyncExternalStore } from 'react'
import { getForgeWebAppEntry } from '../../../../shared/forge-web-app-registry'

const FAVORITE_STORAGE_KEY = 'orca.forge.webAppFavorite.v1'

const listeners = new Set<() => void>()

function isValidFavoriteId(id: string | null): id is string {
  return id !== null && getForgeWebAppEntry(id) !== undefined
}

function emitChange(): void {
  for (const listener of listeners) {
    listener()
  }
}

/** Reads the favorited pinned app id, or null when none is set or the stored id is unknown. */
export function readForgeWebAppFavoriteId(): string | null {
  try {
    const stored = window.localStorage.getItem(FAVORITE_STORAGE_KEY)
    return isValidFavoriteId(stored) ? stored : null
  } catch {
    return null
  }
}

/**
 * Sets (or clears) the single favorite. Favoriting one app replaces the previous favorite; an
 * unknown id clears instead of storing, so the standalone entry can never point nowhere.
 */
export function setForgeWebAppFavoriteId(id: string | null): void {
  try {
    if (isValidFavoriteId(id)) {
      window.localStorage.setItem(FAVORITE_STORAGE_KEY, id)
    } else {
      window.localStorage.removeItem(FAVORITE_STORAGE_KEY)
    }
  } catch {
    // Why: losing the favorite only hides the standalone entry; the dropdown still lists every app.
  }
  emitChange()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useForgeWebAppFavorite(): string | null {
  return useSyncExternalStore(subscribe, readForgeWebAppFavoriteId)
}
