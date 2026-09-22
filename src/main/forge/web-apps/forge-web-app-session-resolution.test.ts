import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetProfile = vi.fn()
const mockCreateProfile = vi.fn()

vi.mock('../../browser/browser-session-registry', () => ({
  browserSessionRegistry: {
    getProfile: (...args: unknown[]) => mockGetProfile(...args),
    createProfile: (...args: unknown[]) => mockCreateProfile(...args)
  }
}))

vi.mock('../../persistence/loading-store/user-data-path', () => ({
  getCanonicalUserDataPath: () => '/tmp/forge-web-app-session-resolution-test'
}))

const fsState = new Map<string, string>()

vi.mock('node:fs', () => ({
  existsSync: (path: string) => fsState.has(path),
  readFileSync: (path: string) => fsState.get(path) ?? '{}',
  writeFileSync: (path: string, content: string) => {
    fsState.set(path, content)
  },
  mkdirSync: () => undefined
}))

import { resolveForgeWebAppSessionPartition } from './forge-web-app-session-resolution'

describe('resolveForgeWebAppSessionPartition', () => {
  beforeEach(() => {
    fsState.clear()
    mockGetProfile.mockReset()
    mockCreateProfile.mockReset()
  })

  it('returns null for an unknown web app id', async () => {
    const result = await resolveForgeWebAppSessionPartition('does-not-exist')
    expect(result).toBeNull()
    expect(mockCreateProfile).not.toHaveBeenCalled()
  })

  it('creates an isolated profile on first resolve and persists the mapping', async () => {
    mockCreateProfile.mockResolvedValueOnce({
      id: 'profile-1',
      scope: 'isolated',
      partition: 'persist:forge-web-app-profile-1',
      label: 'Teams',
      source: null
    })

    const result = await resolveForgeWebAppSessionPartition('teams')

    expect(mockCreateProfile).toHaveBeenCalledWith('isolated', 'Teams')
    expect(result).toEqual({ profileId: 'profile-1', partition: 'persist:forge-web-app-profile-1' })
  })

  it('reuses the persisted profile mapping on a later resolve', async () => {
    mockCreateProfile.mockResolvedValueOnce({
      id: 'profile-1',
      scope: 'isolated',
      partition: 'persist:forge-web-app-profile-1',
      label: 'Teams',
      source: null
    })
    await resolveForgeWebAppSessionPartition('teams')

    mockGetProfile.mockReturnValueOnce({
      id: 'profile-1',
      scope: 'isolated',
      partition: 'persist:forge-web-app-profile-1',
      label: 'Teams',
      source: null
    })
    const result = await resolveForgeWebAppSessionPartition('teams')

    expect(mockCreateProfile).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ profileId: 'profile-1', partition: 'persist:forge-web-app-profile-1' })
  })

  it('mints a fresh profile when the previously mapped one no longer exists', async () => {
    mockCreateProfile.mockResolvedValueOnce({
      id: 'profile-1',
      scope: 'isolated',
      partition: 'persist:forge-web-app-profile-1',
      label: 'Teams',
      source: null
    })
    await resolveForgeWebAppSessionPartition('teams')

    mockGetProfile.mockReturnValueOnce(null)
    mockCreateProfile.mockResolvedValueOnce({
      id: 'profile-2',
      scope: 'isolated',
      partition: 'persist:forge-web-app-profile-2',
      label: 'Teams',
      source: null
    })
    const result = await resolveForgeWebAppSessionPartition('teams')

    expect(mockCreateProfile).toHaveBeenCalledTimes(2)
    expect(result).toEqual({ profileId: 'profile-2', partition: 'persist:forge-web-app-profile-2' })
  })

  it('returns null when the registry refuses to create a profile', async () => {
    mockCreateProfile.mockResolvedValueOnce(null)
    const result = await resolveForgeWebAppSessionPartition('teams')
    expect(result).toBeNull()
  })
})
