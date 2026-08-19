import { auth } from "@/auth"
import { HomeClient } from "./HomeClient"

export default async function Home() {
  const session = await auth()
  const isLoggedIn = !!session?.user

  return <HomeClient isLoggedIn={isLoggedIn} />
}
