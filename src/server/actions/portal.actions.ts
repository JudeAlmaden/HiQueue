"use server"

import { auth } from "@/auth"
import { db } from "@/server/lib/db"
import type { PortalTheme, PortalBranding } from "@/lib/portal-theme"

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Update the portal theme for an organization
 */
export async function updatePortalTheme(
  organizationId: string,
  theme: PortalTheme
): Promise<ActionResult> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify user is a member of the organization and has permission
    const membership = await db.organizationMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      select: { organizationId: true, role: true },
    })

    if (!membership || membership.organizationId !== organizationId) {
      return { success: false, error: "Not authorized to modify this organization" }
    }

    // Only owners can modify portal settings
    if (membership.role !== "owner") {
      return { success: false, error: "Insufficient permissions. Only the owner can customize the portal." }
    }

    // Validate and sanitize theme data
    const sanitizedTheme: PortalTheme = {
      themeClass: theme.themeClass ? String(theme.themeClass) : undefined,
      mode: theme.mode === "dark" ? "dark" : theme.mode === "light" ? "light" : undefined,
      layout:
        theme.layout && typeof theme.layout === "object"
          ? {
              login:
                theme.layout.login === "split" || theme.layout.login === "minimal"
                  ? theme.layout.login
                  : theme.layout.login === "centered"
                    ? "centered"
                    : undefined,
              ticketing:
                theme.layout.ticketing === "split-services"
                  ? theme.layout.ticketing
                  : theme.layout.ticketing === "card"
                    ? "card"
                    : undefined,
              liveDisplay:
                theme.layout.liveDisplay === "no-waiting"
                  ? "no-waiting"
                  : theme.layout.liveDisplay === "standard"
                    ? "standard"
                    : undefined,
              track:
                theme.layout.track === "centered"
                  ? "centered"
                  : undefined,
            }
          : undefined,
      layoutControls:
        theme.layoutControls && typeof theme.layoutControls === "object"
          ? {
              login: sanitizeLayoutControl(theme.layoutControls.login, true),
              ticketing: sanitizeLayoutControl(theme.layoutControls.ticketing, false),
              liveDisplay: sanitizeLayoutControl(theme.layoutControls.liveDisplay, false),
              track: sanitizeLayoutControl(theme.layoutControls.track, false),
            }
          : undefined,
      cssVars: theme.cssVars && typeof theme.cssVars === "object" 
        ? theme.cssVars 
        : undefined,
    }

    // Update the organization's portalTheme
    await db.organization.update({
      where: { id: organizationId },
      data: {
        portalTheme: JSON.stringify(sanitizedTheme),
      },
    })

    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error updating portal theme:", error)
    return { success: false, error: "Failed to update portal theme" }
  }
}

function sanitizeLayoutControl(
  value: unknown,
  allowSplitRightPanelBg: boolean
): {
  splitLeftPanelBgImage?: string
  splitLeftPanelBg?: string
  splitRightPanelBg?: string
  pageBg?: string
  pageBgImage?: string
  typographyScale?: number
  fontColor?: string
  sharpness?: number
} | undefined {
  if (!value || typeof value !== "object") return undefined
  const obj = value as Record<string, unknown>

  const result = {
    splitLeftPanelBgImage:
      allowSplitRightPanelBg && typeof obj.splitLeftPanelBgImage === "string"
        ? String(obj.splitLeftPanelBgImage)
        : undefined,
    splitLeftPanelBg:
      allowSplitRightPanelBg && typeof obj.splitLeftPanelBg === "string"
        ? String(obj.splitLeftPanelBg)
        : undefined,
    splitRightPanelBg:
      allowSplitRightPanelBg && typeof obj.splitRightPanelBg === "string"
        ? String(obj.splitRightPanelBg)
        : undefined,
    pageBg: typeof obj.pageBg === "string" ? String(obj.pageBg) : undefined,
    pageBgImage: typeof obj.pageBgImage === "string" ? String(obj.pageBgImage) : undefined,
    typographyScale:
      typeof obj.typographyScale === "number"
        ? Math.min(1.25, Math.max(0.85, obj.typographyScale))
        : undefined,
    fontColor: typeof obj.fontColor === "string" ? String(obj.fontColor) : undefined,
    sharpness:
      typeof obj.sharpness === "number"
        ? Math.min(24, Math.max(0, obj.sharpness))
        : undefined,
  }

  return result
}

/**
 * Update the portal branding for an organization
 */
export async function updatePortalBranding(
  organizationId: string,
  branding: PortalBranding
): Promise<ActionResult> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify user is a member of the organization and has permission
    const membership = await db.organizationMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      select: { organizationId: true, role: true },
    })

    if (!membership || membership.organizationId !== organizationId) {
      return { success: false, error: "Not authorized to modify this organization" }
    }

    // Only owners can modify portal settings
    if (membership.role !== "owner") {
      return { success: false, error: "Insufficient permissions. Only the owner can customize the portal." }
    }

    // Validate and sanitize branding data
    const sanitizedBranding: PortalBranding = {
      welcomeMessage: branding.welcomeMessage ? String(branding.welcomeMessage) : undefined,
      tagline: branding.tagline ? String(branding.tagline) : undefined,
      logoUrl: branding.logoUrl ? String(branding.logoUrl) : undefined,
    }

    // Update the organization's portalBranding
    await db.organization.update({
      where: { id: organizationId },
      data: {
        portalBranding: JSON.stringify(sanitizedBranding),
      },
    })

    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error updating portal branding:", error)
    return { success: false, error: "Failed to update portal branding" }
  }
}

/**
 * Reset portal customization to defaults
 */
export async function resetPortalCustomization(
  organizationId: string
): Promise<ActionResult> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify user is a member of the organization and has permission
    const membership = await db.organizationMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      select: { organizationId: true, role: true },
    })

    if (!membership || membership.organizationId !== organizationId) {
      return { success: false, error: "Not authorized to modify this organization" }
    }

    // Only owners can modify portal settings
    if (membership.role !== "owner") {
      return { success: false, error: "Insufficient permissions. Only the owner can reset the portal." }
    }

    // Reset both theme and branding to empty objects
    await db.organization.update({
      where: { id: organizationId },
      data: {
        portalTheme: "{}",
        portalBranding: "{}",
      },
    })

    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error resetting portal customization:", error)
    return { success: false, error: "Failed to reset portal customization" }
  }
}
