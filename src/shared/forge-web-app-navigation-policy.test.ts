import { describe, expect, it } from 'vitest'
import { decideForgeWebAppNavigation } from './forge-web-app-navigation-policy'

describe('decideForgeWebAppNavigation', () => {
  it('stays in-app for the registered app domain', () => {
    expect(decideForgeWebAppNavigation('teams', 'https://teams.microsoft.com/v2/')).toBe(
      'stay-in-app'
    )
  })

  it('stays in-app for an explicitly allowed subdomain', () => {
    expect(
      decideForgeWebAppNavigation('teams', 'https://login.microsoftonline.com/oauth2/authorize')
    ).toBe('stay-in-app')
  })

  it('stays in-app for a subdomain of an allowed host', () => {
    expect(decideForgeWebAppNavigation('teams', 'https://eu.teams.microsoft.com/')).toBe(
      'stay-in-app'
    )
  })

  it('opens externally for an unrelated domain', () => {
    expect(decideForgeWebAppNavigation('teams', 'https://example.com/some-link')).toBe(
      'open-externally'
    )
  })

  it('opens externally when the target url is unparsable', () => {
    expect(decideForgeWebAppNavigation('teams', 'not a url')).toBe('open-externally')
  })

  it('opens externally for an unknown app id', () => {
    expect(decideForgeWebAppNavigation('does-not-exist', 'https://teams.microsoft.com/')).toBe(
      'open-externally'
    )
  })

  it('falls back to the entry url hostname when allowedHosts is omitted', () => {
    expect(decideForgeWebAppNavigation('openwebui', 'http://localhost:3000/chat')).toBe(
      'stay-in-app'
    )
    expect(decideForgeWebAppNavigation('openwebui', 'https://example.com/')).toBe(
      'open-externally'
    )
  })
})
