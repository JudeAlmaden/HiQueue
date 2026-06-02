import { NextResponse } from "next/server"
import path from "path"
import { mkdir, writeFile } from "fs/promises"
import { auth } from "@/auth"
import { db } from "@/server/lib/db"

export const runtime = "nodejs"

const MAX_BYTES = 1_000_000 // 1MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
])

function extFromMime(mime: string) {
  switch (mime) {
    case "image/png":
      return "png"
    case "image/jpeg":
    case "image/jpg":
      return "jpg"
    case "image/webp":
      return "webp"
    case "image/svg+xml":
      return "svg"
    default:
      return null
  }
}

export async function POST(request: Request) {
  const driver = (process.env.LOGO_STORAGE_DRIVER ?? "filesystem").toLowerCase()
  if (driver !== "filesystem") {
    return NextResponse.json(
      { error: `Logo storage driver '${driver}' not configured yet.` },
      { status: 501 }
    )
  }

  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const form = await request.formData()
  const organizationId = String(form.get("organizationId") ?? "")
  const file = form.get("file")

  if (!organizationId) {
    return NextResponse.json({ error: "Missing organizationId" }, { status: 400 })
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 1MB)" }, { status: 400 })
  }

  // Only owners can upload portal branding assets
  const membership = await db.organizationMembership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
    select: { role: true },
  })
  if (!membership) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }
  if (membership.role !== "owner") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  }

  const ext = extFromMime(file.type)
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const filename = `logo-${Date.now()}.${ext}`
  const relDir = `/uploads/org/${organizationId}`
  const relPath = `${relDir}/${filename}`
  const absDir = path.join(process.cwd(), "public", "uploads", "org", organizationId)
  const absPath = path.join(absDir, filename)

  await mkdir(absDir, { recursive: true })
  await writeFile(absPath, bytes)

  return NextResponse.json({ url: relPath })
}

