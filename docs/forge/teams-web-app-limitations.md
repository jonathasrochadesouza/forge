# Microsoft Teams (web) — pinned app limitations

Teams is pinned via the web app registry (`src/shared/forge-web-app-registry.ts`,
id `teams`) rather than the native desktop client. This documents what the web
version cannot do inside Forge's pinned browser tab, per FORGE-19's acceptance
criteria.

## What works

- Sign-in and session persistence across app restarts — the tab uses an
  isolated browser session profile (`src/main/forge/web-apps/forge-web-app-session-resolution.ts`),
  so cookies/tokens survive a relaunch the same way any isolated Orca browser
  profile does.
- Chat, channels, and the unread-message badge (parsed from the tab title's
  leading `(N)` count, see `src/shared/forge-web-app-unread-count.ts`).
- Links to other Microsoft domains (e.g. `login.microsoftonline.com` for
  SSO) open in the same tab; anything else opens in the system browser
  (`src/shared/forge-web-app-navigation-policy.ts`).

## Known limitations of Teams on the web

- **Audio/video calls may require the native client.** Microsoft's web
  client supports calling in most Chromium-based browsers, but call quality,
  background blur, and some device selection features are more limited than
  the native desktop app, and some organizations disable web calling entirely
  via tenant policy. If a call fails to start, the user is expected to fall
  back to the native Teams app.
- **Global/native OS notifications are not wired up.** The unread badge is
  read from the tab title, which only updates while the tab exists; there is
  no native OS notification banner for a new message the way the desktop
  Teams app provides.
- **Screen sharing and background effects** can behave inconsistently
  across browser engines; Electron's Chromium build is generally on par with
  desktop Chrome, but this has not been exhaustively verified against every
  Teams web feature.
- **Confirming or canceling calendar meetings programmatically** is out of
  scope for this integration — it requires the Microsoft Graph API and is
  tracked separately under FE-9.

## Out of scope (per FORGE-19)

Programmatic meeting confirm/cancel via Microsoft Graph API is explicitly out
of scope for the pinned web app; that requires its own Graph API integration
card (FE-9).
