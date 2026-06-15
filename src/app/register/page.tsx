import { redirect } from "next/navigation"
import RegisterForm from "./RegisterForm"

export default function RegisterPage() {
  // Block registration in production — only Google sign-in is supported
  if (process.env.NODE_ENV === "production") {
    redirect("/login")
  }

  return <RegisterForm />
}
