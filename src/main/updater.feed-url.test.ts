import { describe, expect, it } from 'vitest'
import { FORGE_RELEASE_FEED_URL } from './updater/forge-updater-feed-url'

describe('FORGE_RELEASE_FEED_URL', () => {
  it('points at the fork repo, never at the upstream Orca feed', () => {
    expect(FORGE_RELEASE_FEED_URL).toBe(
      'https://github.com/jonathasrochadesouza/forge/releases/latest/download'
    )
    expect(FORGE_RELEASE_FEED_URL).not.toContain('stablyai')
  })
})
