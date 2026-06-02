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
      where: { userId },
      select: { organizationId: true, role: true },
    })

    if (!membership || membership.organizationId !== organizationId) {
      return { success: false, error: "Not authorized to modify this organization" }
    }

    // Only owners and admins can modify portal settings
    if (membership.role !== "owner" && membership.role !== "admin") {
      return { success: false, error: "Insufficient permissions. Only owners and admins can customize the portal." }
    }

    // Validate and sanitize theme data
    const sanitizedTheme: PortalTheme = {
      themeClass: theme.themeClass ? String(theme.themeClass) : undefined,
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
      where: { userId },
      select: { organizationId: true, role: true },
    })

    if (!membership || membership.organizationId !== organizationId) {
      return { success: false, error: "Not authorized to modify this organization" }
    }

    // Only owners and admins can modify portal settings
    if (membership.role !== "owner" && membership.role !== "admin") {
      return { success: false, error: "Insufficient permissions. Only owners and admins can customize the portal." }
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
      where: { userId },
      select: { organizationId: true, role: true },
    })

    if (!membership || membership.organizationId !== organizationId) {
      return { success: false, error: "Not authorized to modify this organization" }
    }

    // Only owners and admins can modify portal settings
    if (membership.role !== "owner" && membership.role !== "admin") {
      return { success: false, error: "Insufficient permissions. Only owners and admins can reset the portal." }
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
