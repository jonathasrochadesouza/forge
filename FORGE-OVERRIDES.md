# FORGE Overrides Log

Every modification to an upstream-owned file is logged here (one line per
change). This is the conflict map consulted during every upstream sync.

Format: `<file> — <what we changed> — <why> — <date>`

| File | Change | Why | Date |
|---|---|---|---|
| package.json | name→forge, description, homepage, author, version | rebrand | 2026-09-19 |
| src/renderer/src/components/sidebar/SidebarNav.tsx | added `<ForgeWebAppSidebarEntry />` import + render call after `<SidebarTaskNavButton />` | no existing extension slot for sidebar entries; needed to expose FORGE-16 pinned web apps list (user-approved exception) | 2026-09-22 |
| .gitignore | added `!docs/forge/` and `!docs/forge/**` to the docs allow-list | steering rules define `docs/forge/` as the canonical Forge docs location, but the upstream allow-list had no entry for it; needed to track FORGE-19's Teams web limitations doc | 2026-09-22 |
| config/electron-builder.config.cjs | appId→com.forge.ide, productName/executableName→Forge, nsis artifactName→forge-windows-setup, publish→jonathasrochadesouza/forge, removed SignPath publisherName | prevent dev builds from clobbering the installed upstream Orca (same appId/productName) and from auto-downloading upstream installers (user-approved identity fork) | 2026-09-24 |
| config/nsis/orca-installer-hooks.nsh | daemon-host sweep path→%LOCALAPPDATA%\Forge, MARKDOWN_PROGID→Forge.Markdown | same conflict as above: shared paths/ProgID made Forge installer/uninstaller destroy Orca's daemon and Markdown association (user-approved) | 2026-09-24 |
| src/shared/local-build-compatibility-contract.json | appId→com.forge.ide | ratchet contract must match the builder config appId or local-build validation rejects Forge's own builds (user-approved) | 2026-09-24 |
| src/shared/local-build-compatibility-contract.ts | appId→com.forge.ide | same as contract.json (user-approved) | 2026-09-24 |
| src/main/daemon/daemon-host-relocation.ts | LOCAL_HOST_ROOT_NAME→Forge | keep the relocated daemon runtime out of the installed Orca's %LOCALAPPDATA%\Orca\daemon-host (user-approved) | 2026-09-24 |
| src/main/startup/dev-instance-identity.ts | BASE_APP_NAME→Forge, BASE_APP_USER_MODEL_ID→com.forge.ide | packaged Forge must not claim Orca's Windows taskbar/notification identity (user-approved) | 2026-09-24 |
| Test pins updated alongside (electron-builder-mac-channel-config, mac-build-compatibility, verify-dev-channel-packaging, local-build-compatibility-contract, local-build-candidate, local-build-compatibility, dev-instance-identity, daemon-host-relocation tests) | updated value pins to the Forge identity | keep the ratchet tests green against the forked identity; expect "ours wins" conflict resolution on sync | 2026-09-24 |
| mobile/.gitignore | added `.gradle/` and `local.properties` (unanchored, cover nested `modules/*/android` dirs) | nested expo android modules only ignore `/build/`; their Gradle caches showed up untracked and could be caught by a bulk `git add` (same failure class as the committed node_modules symlink, upstream .gitignore lines 20-22) | 2026-09-25 |

No other upstream file has been modified. Keep it that way — if you add an entry,
you must have first confirmed the file is on the Mutation Whitelist in FORGE.md.
