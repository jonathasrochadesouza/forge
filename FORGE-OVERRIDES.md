# FORGE Overrides Log

Every modification to an upstream-owned file is logged here (one line per
change). This is the conflict map consulted during every upstream sync.

Format: `<file> — <what we changed> — <why> — <date>`

| File | Change | Why | Date |
|---|---|---|---|
| package.json | name→forge, description, homepage, author, version | rebrand | 2026-09-19 |
| src/renderer/src/components/sidebar/SidebarNav.tsx | added `<ForgeWebAppSidebarEntry />` import + render call after `<SidebarTaskNavButton />` | no existing extension slot for sidebar entries; needed to expose FORGE-16 pinned web apps list (user-approved exception) | 2026-09-22 |
| .gitignore | added `!docs/forge/` and `!docs/forge/**` to the docs allow-list | steering rules define `docs/forge/` as the canonical Forge docs location, but the upstream allow-list had no entry for it; needed to track FORGE-19's Teams web limitations doc | 2026-09-22 |

No other upstream file has been modified. Keep it that way — if you add an entry,
you must have first confirmed the file is on the Mutation Whitelist in FORGE.md.
