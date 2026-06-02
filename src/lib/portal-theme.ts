export type PortalLayoutSettings = {
  login?: "centered" | "split" | "minimal"
  ticketing?: "card" | "split-services"
  liveDisplay?: "standard" | "no-waiting"
  track?: "centered" | "split" | "compact"
}

export type PortalLayoutControlSettings = {
  login?: {
    splitRightPanelBg?: string
    pageBg?: string
    pageBgImage?: string
    useThemeDefault?: boolean
    typographyScale?: number
    fontColor?: string
    sharpness?: number
  }
  ticketing?: {
    pageBg?: string
    pageBgImage?: string
    useThemeDefault?: boolean
    typographyScale?: number
    fontColor?: string
    sharpness?: number
  }
  liveDisplay?: {
    pageBg?: string
    pageBgImage?: string
    useThemeDefault?: boolean
    typographyScale?: number
    fontColor?: string
    sharpness?: number
  }
  track?: {
    pageBg?: string
    pageBgImage?: string
    useThemeDefault?: boolean
    typographyScale?: number
    fontColor?: string
    sharpness?: number
  }
}

export type PortalTheme = {
  /** Tailwind theme class on <html> or portal root, e.g. theme-ocean */
  themeClass?: string
  /** Explicit color mode for the org portal/dashboard theme */
  mode?: "light" | "dark"
  /** Per-surface layout presets for portal-facing screens */
  layout?: PortalLayoutSettings
  /** Per-surface visual controls for each layout */
  layoutControls?: PortalLayoutControlSettings
  /** Optional CSS custom properties for portal accent overrides */
  cssVars?: Record<string, string>
}

export type PortalBranding = {
  welcomeMessage?: string
  tagline?: string
  logoUrl?: string
}

export type OrgPortalContext = {
  id: string
  name: string
  slug: string
  theme: PortalTheme
  branding: PortalBranding
}

export function parsePortalTheme(raw: string): PortalTheme {
  try {
    const parsed = JSON.parse(raw || "{}")
    if (!parsed || typeof parsed !== "object") return {}
    const parsedLayout = parsed.layout
    const parsedLayoutControls = parsed.layoutControls
    const parseControlGroup = (value: unknown) => {
      if (!value || typeof value !== "object") return undefined
      const obj = value as Record<string, unknown>
      return {
        splitRightPanelBg:
          typeof obj.splitRightPanelBg === "string" ? obj.splitRightPanelBg : undefined,
        pageBg: typeof obj.pageBg === "string" ? obj.pageBg : undefined,
        pageBgImage: typeof obj.pageBgImage === "string" ? obj.pageBgImage : undefined,
        useThemeDefault: typeof obj.useThemeDefault === "boolean" ? obj.useThemeDefault : undefined,
        typographyScale:
          typeof obj.typographyScale === "number" ? Math.min(1.25, Math.max(0.85, obj.typographyScale)) : undefined,
        fontColor: typeof obj.fontColor === "string" ? obj.fontColor : undefined,
        sharpness:
          typeof obj.sharpness === "number" ? Math.min(24, Math.max(0, obj.sharpness)) : undefined,
      }
    }

    const layoutFromObject =
      parsedLayout && typeof parsedLayout === "object"
        ? {
            login:
              parsedLayout.login === "split" || parsedLayout.login === "minimal"
                ? parsedLayout.login
                : parsedLayout.login === "showcase"
                  ? "split"
                  : parsedLayout.login === "kiosk"
                    ? "minimal"
                : parsedLayout.login === "centered"
                  ? "centered"
                  : undefined,
            ticketing:
              parsedLayout.ticketing === "split-services"
                ? parsedLayout.ticketing
                : parsedLayout.ticketing === "tiles"
                  ? "split-services"
                : parsedLayout.ticketing === "card"
                  ? "card"
                  : undefined,
            liveDisplay:
              parsedLayout.liveDisplay === "no-waiting"
                ? "no-waiting"
                : parsedLayout.liveDisplay === "standard" || parsedLayout.liveDisplay === "ads" || parsedLayout.liveDisplay === "ticker-wall" || parsedLayout.liveDisplay === "theater"
                  ? "standard"
                  : undefined,
            track:
              parsedLayout.track === "centered" || parsedLayout.track === "split" || parsedLayout.track === "compact" || parsedLayout.track === "status-first" || parsedLayout.track === "timeline"
                ? "centered"
                : undefined,
          }
        : undefined

    const layoutControlsFromObject =
      parsedLayoutControls && typeof parsedLayoutControls === "object"
        ? {
            login: parseControlGroup((parsedLayoutControls as Record<string, unknown>).login),
            ticketing: parseControlGroup((parsedLayoutControls as Record<string, unknown>).ticketing),
            liveDisplay: parseControlGroup((parsedLayoutControls as Record<string, unknown>).liveDisplay),
            track: parseControlGroup((parsedLayoutControls as Record<string, unknown>).track),
          }
        : undefined

    // Backward compatibility for previous single layout string
    const legacyLayout =
      parsedLayout === "compact" || parsedLayout === "focus" || parsedLayout === "default"
        ? parsedLayout
        : undefined

    return {
      themeClass: typeof parsed.themeClass === "string" ? parsed.themeClass : undefined,
      mode: parsed.mode === "dark" ? "dark" : parsed.mode === "light" ? "light" : undefined,
      layout:
        layoutFromObject ??
        (legacyLayout
          ? {
              login: legacyLayout === "focus" ? "split" : "centered",
              ticketing:
                legacyLayout === "compact"
                  ? "split-services"
                  : legacyLayout === "focus"
                    ? "split-services"
                    : "card",
              liveDisplay:
                legacyLayout === "compact"
                  ? "no-waiting"
                  : legacyLayout === "focus"
                    ? "standard" // was ads
                    : "standard",
              track: "centered",
            }
          : undefined),
      layoutControls: layoutControlsFromObject,
      cssVars:
        parsed.cssVars && typeof parsed.cssVars === "object"
          ? (parsed.cssVars as Record<string, string>)
          : undefined,
    }
  } catch {
    return {}
  }
}

export function parsePortalBranding(raw: string): PortalBranding {
  try {
    const parsed = JSON.parse(raw || "{}")
    if (!parsed || typeof parsed !== "object") return {}
    return {
      welcomeMessage:
        typeof parsed.welcomeMessage === "string" ? parsed.welcomeMessage : undefined,
      tagline: typeof parsed.tagline === "string" ? parsed.tagline : undefined,
      logoUrl: typeof parsed.logoUrl === "string" ? parsed.logoUrl : undefined,
    }
  } catch {
    return {}
  }
}

export function portalThemeToStyle(theme: PortalTheme): Record<string, string> {
  return theme.cssVars ?? {}
}

export function parsePreviewThemeParam(raw?: string): PortalTheme | undefined {
  if (!raw) return undefined
  try {
    const decoded = decodeURIComponent(raw)
    return parsePortalTheme(decoded)
  } catch {
    return undefined
  }
}

export function mergePortalTheme(base: PortalTheme, override?: PortalTheme): PortalTheme {
  if (!override) return base
  return {
    ...base,
    ...override,
    layout: {
      ...(base.layout ?? {}),
      ...(override.layout ?? {}),
    },
    layoutControls: {
      ...(base.layoutControls ?? {}),
      ...(override.layoutControls ?? {}),
    },
    cssVars: {
      ...(base.cssVars ?? {}),
      ...(override.cssVars ?? {}),
    },
  }
}
