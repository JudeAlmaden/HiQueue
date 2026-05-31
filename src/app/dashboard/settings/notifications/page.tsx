import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const NOTIFICATION_ITEMS = [
  {
    id: "queue-alerts",
    label: "Queue alerts",
    description: "Notify when wait times spike or a queue is paused.",
    enabled: true,
  },
  {
    id: "member-activity",
    label: "Member activity",
    description: "Email when someone joins or leaves your workspace.",
    enabled: true,
  },
  {
    id: "weekly-digest",
    label: "Weekly digest",
    description: "Summary of tickets served and peak hours.",
    enabled: false,
  },
]

export default function NotificationsSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what you want to be notified about.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-w-md">
          <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
            Template only — notification delivery is not configured yet.
          </p>

          <ul className="space-y-4">
            {NOTIFICATION_ITEMS.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">{item.label}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
                <div
                  role="presentation"
                  className={`relative h-6 w-11 shrink-0 rounded-full ${
                    item.enabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      item.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </li>
            ))}
          </ul>

          <Button type="button">Save preferences</Button>
        </div>
      </CardContent>
    </Card>
  )
}
