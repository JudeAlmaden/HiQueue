export type PortalTheme = {
  /** Tailwind theme class on <html> or portal root, e.g. theme-ocean */
  themeClass?: string
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
    return {
      themeClass: typeof parsed.themeClass === "string" ? parsed.themeClass : undefined,
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
