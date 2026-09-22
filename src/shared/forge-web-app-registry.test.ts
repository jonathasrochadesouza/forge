import { describe, expect, it } from 'vitest'
import {
  FORGE_WEB_APP_REGISTRY,
  getForgeWebAppEntry,
  listForgeWebAppEntries
} from './forge-web-app-registry'

describe('forge-web-app-registry', () => {
  it('ships at least two example apps, proving one entry per new app', () => {
    expect(FORGE_WEB_APP_REGISTRY.length).toBeGreaterThanOrEqual(2)
  })

  it('every entry has a unique id and a parseable url', () => {
    const ids = new Set<string>()
    for (const entry of FORGE_WEB_APP_REGISTRY) {
      expect(ids.has(entry.id)).toBe(false)
      ids.add(entry.id)
      expect(() => new URL(entry.url)).not.toThrow()
    }
  })

  it('getForgeWebAppEntry resolves a known id and returns undefined otherwise', () => {
    expect(getForgeWebAppEntry('teams')?.title).toBe('Teams')
    expect(getForgeWebAppEntry('does-not-exist')).toBeUndefined()
  })

  it('listForgeWebAppEntries returns the full catalog', () => {
    expect(listForgeWebAppEntries()).toBe(FORGE_WEB_APP_REGISTRY)
  })
})
