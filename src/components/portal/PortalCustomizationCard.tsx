import Link from "next/link"
import { Palette, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PortalCustomizationCardProps {
  orgSlug: string
  portalLoginUrl: string
}

export function PortalCustomizationCard({ orgSlug, portalLoginUrl }: PortalCustomizationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle>Staff portal</CardTitle>
        </div>
        <CardDescription>
          Theme and branding for your public staff portal. Saved to{" "}
          <code className="text-xs">portalTheme</code> and{" "}
          <code className="text-xs">portalBranding</code> on your organization — customization
          controls coming to this page soon.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground space-y-2">
          <p>
            Staff sign-in URL:{" "}
            <Link href={portalLoginUrl} className="font-mono text-primary hover:underline break-all">
              {portalLoginUrl}
            </Link>
          </p>
          <p className="text-xs">
            Future: pick accent colors, welcome message, logo, and layout presets. The portal reads
            those settings automatically at <span className="font-mono">/org/{orgSlug}/login</span>.
          </p>
        </div>
        <Link
          href={portalLoginUrl}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Open staff portal
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}
