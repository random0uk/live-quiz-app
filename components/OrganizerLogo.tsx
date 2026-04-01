"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

/**
 * Fetches the organizer logo from Supabase and renders it fixed at the top-left.
 * Renders nothing if no logo has been uploaded.
 */
export default function OrganizerLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

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

  if (!logoUrl) return null

  return (
    <div className="fixed top-3 left-3 z-50 pointer-events-none">
      <img
        src={logoUrl}
        alt="Organizer logo"
        className="h-8 w-auto max-w-[80px] object-contain rounded-lg opacity-90"
      />
    </div>
  )
}
