// Resolves an isolated browser session partition per pinned web app, reusing browserSessionRegistry
// (src/main/browser/) so login for one app never shares cookies with another.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { browserSessionRegistry } from '../../browser/browser-session-registry'
import { getCanonicalUserDataPath } from '../../persistence/loading-store/user-data-path'
import { getForgeWebAppEntry } from '../../../shared/forge-web-app-registry'

const MAPPING_FILE_NAME = 'forge-web-app-sessions.json'

type ForgeWebAppProfileMapping = Record<string, string>

function mappingFilePath(): string {
  return join(getCanonicalUserDataPath(), MAPPING_FILE_NAME)
}

function loadMapping(): ForgeWebAppProfileMapping {
  try {
    const path = mappingFilePath()
    if (!existsSync(path)) {
      return {}
    }
    const parsed = JSON.parse(readFileSync(path, 'utf-8'))
    return parsed && typeof parsed === 'object' ? (parsed as ForgeWebAppProfileMapping) : {}
  } catch {
    return {}
  }
}

function persistMapping(mapping: ForgeWebAppProfileMapping): void {
  try {
    mkdirSync(getCanonicalUserDataPath(), { recursive: true })
    writeFileSync(mappingFilePath(), JSON.stringify(mapping, null, 2), 'utf-8')
  } catch {
    // Why: losing the mapping only means the next resolve mints a fresh isolated profile.
  }
}

/**
 * Resolves the isolated session partition for a pinned web app, creating one on first use.
 * The mapping from app id -> browser session profile id is persisted so repeated opens reuse it.
 */
export async function resolveForgeWebAppSessionPartition(
  webAppId: string
): Promise<{ profileId: string; partition: string } | null> {
  const entry = getForgeWebAppEntry(webAppId)
  if (!entry) {
    return null
  }

  const mapping = loadMapping()
  const existingProfileId = mapping[webAppId]
  if (existingProfileId) {
    const existingProfile = browserSessionRegistry.getProfile(existingProfileId)
    if (existingProfile) {
      return { profileId: existingProfile.id, partition: existingProfile.partition }
    }
  }

  const created = await browserSessionRegistry.createProfile('isolated', entry.title)
  if (!created) {
    return null
  }
  mapping[webAppId] = created.id
  persistMapping(mapping)
  return { profileId: created.id, partition: created.partition }
}
