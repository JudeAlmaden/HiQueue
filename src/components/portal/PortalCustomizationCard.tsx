import Link from "next/link"
import { Palette, ExternalLink, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
          <CardTitle>Staff Portal</CardTitle>
        </div>
        <CardDescription>
          Customize your staff portal&apos;s theme, branding, and appearance to match your organization&apos;s identity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground space-y-2">
          <p>
            Staff sign-in URL:{" "}
            <Link href={portalLoginUrl} target="_blank" className="font-mono text-primary hover:underline break-all">
              {portalLoginUrl}
            </Link>
          </p>
          <p className="text-xs">
            Customize theme colors, upload your logo, add custom welcome messages, and more from the portal settings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/organizations/${orgSlug}/portal`}>
            <Button size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Customize Portal
            </Button>
          </Link>
          <Link
            href={portalLoginUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Staff Portal
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
