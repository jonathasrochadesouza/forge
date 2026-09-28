// @vitest-environment happy-dom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FORGE_WEB_APP_REGISTRY } from '../../../../shared/forge-web-app-registry'
import { ForgeWebAppBrandGlyph } from './forge-web-app-brand-icons'

describe('ForgeWebAppBrandGlyph', () => {
  it('renders an svg glyph for every registered iconId', () => {
    for (const entry of FORGE_WEB_APP_REGISTRY) {
      const { container } = render(<ForgeWebAppBrandGlyph iconId={entry.iconId} />)
      expect(container.querySelector('svg')).not.toBeNull()
      container.remove()
    }
  })
})
