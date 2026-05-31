import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ProfileSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update how your name appears across HiQueue.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" name="name" defaultValue="Alex Morgan" placeholder="Your name" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              defaultValue="alex@acmeclinic.com"
              disabled
              className="opacity-70"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>

          <Button type="button">Save changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}
