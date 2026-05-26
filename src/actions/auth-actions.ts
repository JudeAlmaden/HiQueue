"use server"

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "User already exists with that email." }
  }

  // Hash the password securely
  const hashedPassword = await bcrypt.hash(password, 10)

  // Save the user in the database
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  // Redirect to login after successful registration
  redirect("/login")
}

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function loginUser(formData: FormData) {
  try {
    await signIn("credentials", formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." }
        default:
          return { error: "Something went wrong." }
      }
    }
    throw error // Required for Next.js redirects to work
  }
}
