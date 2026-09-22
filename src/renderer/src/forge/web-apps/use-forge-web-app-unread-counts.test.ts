import { describe, expect, it } from 'vitest'
import { computeForgeWebAppUnreadCounts } from './use-forge-web-app-unread-counts'

describe('computeForgeWebAppUnreadCounts', () => {
  it('reads the unread count for an open pinned app tab', () => {
    const counts = computeForgeWebAppUnreadCounts([
      { url: 'https://teams.microsoft.com/v2/', title: '(5) Microsoft Teams' }
    ])
    expect(counts.teams).toBe(5)
  })

  it('matches a tab by origin regardless of path', () => {
    const counts = computeForgeWebAppUnreadCounts([
      { url: 'https://outlook.office.com/mail/inbox', title: '(2) Outlook' }
    ])
    expect(counts['outlook-calendar']).toBe(2)
  })

  it('reports 0 for a pinned app with no open tab', () => {
    const counts = computeForgeWebAppUnreadCounts([])
    expect(counts.teams).toBe(0)
    expect(counts['outlook-calendar']).toBe(0)
  })

  it('reports 0 for an open tab whose title carries no badge', () => {
    const counts = computeForgeWebAppUnreadCounts([
      { url: 'https://teams.microsoft.com/', title: 'Microsoft Teams' }
    ])
    expect(counts.teams).toBe(0)
  })

  it('covers every registered app id', () => {
    const counts = computeForgeWebAppUnreadCounts([])
    expect(Object.keys(counts)).toEqual(
      expect.arrayContaining(['teams', 'outlook-calendar', 'openwebui'])
    )
  })
})
