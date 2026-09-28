// Monochrome brand glyphs for the pinned web apps, stroke-drawn so they sit seamlessly beside
// the sidebar's lucide icons. Sources: Tabler brand glyphs (MIT) — brand-teams for Teams and
// the Office mark for the Outlook calendar entry (no Outlook glyph exists in MIT sets);
// message-chatbot stands in for OpenWebUI, whose official favicon ships as an embedded raster
// with no vector logo to vendor.
import type { ForgeWebAppIconId } from '../../../../shared/forge-web-app-registry'

export type ForgeWebAppBrandIconProps = React.SVGProps<SVGSVGElement> & { size?: number }

type ForgeWebAppBrandIcon = (props: ForgeWebAppBrandIconProps) => React.JSX.Element

function brandIconSvgProps(
  size: number,
  props: ForgeWebAppBrandIconProps
): React.SVGProps<SVGSVGElement> {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props
  }
}

export function TeamsIcon({ size = 16, ...props }: ForgeWebAppBrandIconProps): React.JSX.Element {
  return (
    <svg {...brandIconSvgProps(size, props)}>
      <path d="M3 7h10v10h-10l0 -10" />
      <path d="M6 10h4" />
      <path d="M8 10v4" />
      <path d="M8.104 17c.47 2.274 2.483 4 4.896 4a5 5 0 0 0 5 -5v-7h-5" />
      <path d="M18 18a4 4 0 0 0 4 -4v-5h-4" />
      <path d="M13.003 8.83a3 3 0 1 0 -1.833 -1.833" />
      <path d="M15.83 8.36a2.5 2.5 0 1 0 .594 -4.117" />
    </svg>
  )
}

export function MicrosoftOfficeIcon({
  size = 16,
  ...props
}: ForgeWebAppBrandIconProps): React.JSX.Element {
  return (
    <svg {...brandIconSvgProps(size, props)}>
      <path d="M4 18h9v-12l-5 2v5l-4 2v-8l9 -4l7 2v13l-7 3l-9 -3" />
    </svg>
  )
}

export function OpenWebUIIcon({
  size = 16,
  ...props
}: ForgeWebAppBrandIconProps): React.JSX.Element {
  return (
    <svg {...brandIconSvgProps(size, props)}>
      <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12" />
      <path d="M9.5 9h.01" />
      <path d="M14.5 9h.01" />
      <path d="M9.5 13a3.5 3.5 0 0 0 5 0" />
    </svg>
  )
}

const FORGE_WEB_APP_BRAND_ICONS: Record<ForgeWebAppIconId, ForgeWebAppBrandIcon> = {
  teams: TeamsIcon,
  'outlook-calendar': MicrosoftOfficeIcon,
  openwebui: OpenWebUIIcon
}

/** Renders the brand glyph registered for a pinned web app's iconId. */
export function ForgeWebAppBrandGlyph({
  iconId,
  ...props
}: ForgeWebAppBrandIconProps & { iconId: ForgeWebAppIconId }): React.JSX.Element {
  const Icon = FORGE_WEB_APP_BRAND_ICONS[iconId]
  return <Icon {...props} />
}
