"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

/**
 * Fetches the organizer logo from Supabase and renders it fixed at the top-left.
 * Only visible on the projector/screen view (/screen/...).
 */
export default function OrganizerLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("organizer_settings")
      .select("logo_url")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data?.logo_url) setLogoUrl(data.logo_url)
      })
  }, [])

  // Only show on the projector screen view
  if (!pathname.startsWith("/screen/")) return null
  if (!logoUrl) return null

  return (
    <div className="fixed top-5 left-6 z-50 pointer-events-none">
      <img
        src={logoUrl}
        alt="Organizer logo"
        className="h-24 w-auto max-w-[220px] object-contain rounded-xl opacity-95"
      />
    </div>
  )
}
