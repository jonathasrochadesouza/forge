// Why: the packaged fork must never re-point its release feed at the upstream
// Orca repo — that would download and silently run upstream installers. This is
// the single source of truth for every runtime feed pin; the builder config's
// `publish` must keep matching this repo.
export const FORGE_RELEASE_FEED_URL =
  'https://github.com/jonathasrochadesouza/forge/releases/latest/download'

// Why: the generic-feed probe walks the releases atom feed of this same repo;
// keeping it beside the latest/download pin is what makes a future repo move a
// one-file change instead of a regex hunt.
export const FORGE_RELEASES_ATOM_FEED_URL =
  'https://github.com/jonathasrochadesouza/forge/releases.atom'
export const FORGE_RELEASES_DOWNLOAD_BASE =
  'https://github.com/jonathasrochadesouza/forge/releases/download'
export const FORGE_RELEASES_TAG_HREF_RE =
  /href="https:\/\/github\.com\/jonathasrochadesouza\/forge\/releases\/tag\/([^"]+)"/g
export const FORGE_RELEASES_DOWNLOAD_URL_RE =
  /^https:\/\/github\.com\/jonathasrochadesouza\/forge\/releases\/download\//i
