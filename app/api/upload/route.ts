import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("[v0] BLOB_READ_WRITE_TOKEN is not set")
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is not configured on the server. Please add it as an environment variable." }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = (formData.get("type") as string) || "puzzles"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 })
    }

    const folder = type === "logo" ? "logos" : "puzzles"
    const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
