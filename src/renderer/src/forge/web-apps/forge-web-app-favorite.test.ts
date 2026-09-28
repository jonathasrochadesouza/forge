// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest'
import { readForgeWebAppFavoriteId, setForgeWebAppFavoriteId } from './forge-web-app-favorite'

describe('forge-web-app-favorite', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts with no favorite', () => {
    expect(readForgeWebAppFavoriteId()).toBeNull()
  })

  it('persists a valid favorite id', () => {
    setForgeWebAppFavoriteId('teams')
    expect(readForgeWebAppFavoriteId()).toBe('teams')
  })

  it('replaces the previous favorite when another app is favorited', () => {
    setForgeWebAppFavoriteId('teams')
    setForgeWebAppFavoriteId('outlook-calendar')
    expect(readForgeWebAppFavoriteId()).toBe('outlook-calendar')
  })

  it('clears the favorite on null', () => {
    setForgeWebAppFavoriteId('teams')
    setForgeWebAppFavoriteId(null)
    expect(readForgeWebAppFavoriteId()).toBeNull()
  })

  it('treats an unknown id as clearing the favorite', () => {
    setForgeWebAppFavoriteId('teams')
    setForgeWebAppFavoriteId('does-not-exist')
    expect(readForgeWebAppFavoriteId()).toBeNull()
  })

  it('reads an unknown stored id as null instead of surfacing it', () => {
    window.localStorage.setItem('orca.forge.webAppFavorite.v1', 'does-not-exist')
    expect(readForgeWebAppFavoriteId()).toBeNull()
  })
})
