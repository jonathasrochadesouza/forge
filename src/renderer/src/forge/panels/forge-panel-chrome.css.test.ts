import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  fileURLToPath(new URL('./forge-panel-chrome.css', import.meta.url)),
  'utf8'
)

describe('forge-panel-chrome.css', () => {
  it('derives every colour from theme tokens, never a raw hex or rgb literal', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(css).not.toMatch(/\brgba?\(/)
  })

  it('declares the radius, gap, inset, border and gutter tokens', () => {
    for (const token of [
      '--forge-panel-radius',
      '--forge-panel-gap',
      '--forge-panel-inset',
      '--forge-panel-border-width',
      '--forge-rail-width',
      '--forge-panel-rail-footprint',
      '--forge-panel-radius-inner',
      '--forge-panel-gutter'
    ]) {
      expect(css).toMatch(new RegExp(`${token}:`))
    }
  })

  it('keeps the inner radius concentric with the outer one and clamped at zero', () => {
    const inner = css.match(/--forge-panel-radius-inner:\s*([^;]+);/)?.[1]
    expect(inner).toMatch(
      /^max\(\s*0px,\s*calc\(var\(--forge-panel-radius\) - var\(--forge-panel-border-width\)\)\s*\)$/
    )
  })

  it('draws the sidebar/dock seam straight and without a gap', () => {
    const seam = css.match(
      /\[data-forge-panel='left'\] \[data-forge-secondary-sidebar\]\s*\{([^}]*)\}/
    )?.[1]
    expect(seam).toContain('border-left')
    expect(seam).not.toMatch(/radius|margin/)
  })

  it('removes border and margin from a collapsed panel', () => {
    const collapsed = css.match(
      /\[data-forge-panel\]\[data-forge-panel-collapsed\]\s*\{([^}]*)\}/
    )?.[1]
    expect(collapsed).toContain('margin: 0')
    expect(collapsed).toContain('border-width: 0')
  })

  it('squares the top corners of panels that touch the window top', () => {
    const flush = css.match(/\[data-forge-panel\]\[data-forge-panel-flush-top\]\s*\{([^}]*)\}/)?.[1]
    expect(flush).toContain('border-top-left-radius: 0')
    expect(flush).toContain('border-top-right-radius: 0')
  })
})
