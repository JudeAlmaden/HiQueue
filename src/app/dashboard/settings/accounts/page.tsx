import { getLinkedAccounts } from "@/server/actions/account.action"
import { AccountsForm } from "./AccountsForm"

export default async function AccountsSettingsPage() {
  const result = await getLinkedAccounts()
  const accounts = result.success ? result.data : []

  return <AccountsForm accounts={accounts} />
}
