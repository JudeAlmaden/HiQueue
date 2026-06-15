import { getUserPasswordStatus } from "@/server/actions/password.action"
import { SecurityForm } from "./SecurityForm"

export default async function SecuritySettingsPage() {
  const result = await getUserPasswordStatus()
  const hasPassword = result.success ? result.data.hasPassword : true

  return <SecurityForm hasPassword={hasPassword} />
}
