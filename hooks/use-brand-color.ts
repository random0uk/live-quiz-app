"use client"

import { useEffect } from "react"

/**
 * Converts a hex color (#rrggbb) to an oklch() CSS string.
 * Uses a linearized approximation good enough for brand color theming.
 */
function hexToOklch(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  // sRGB to linear
  const lr = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const lg = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const lb = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

  // linear RGB to XYZ (D65)
  const x = 0.4124 * lr + 0.3576 * lg + 0.1805 * lb
  const y = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
  const z = 0.0193 * lr + 0.1192 * lg + 0.9505 * lb

  // XYZ to OKLab via M1 and M2 matrices (simplified)
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z)
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z)
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z)

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

  const C = Math.sqrt(a * a + bVal * bVal)
  const h = (Math.atan2(bVal, a) * 180) / Math.PI
  const hue = h < 0 ? h + 360 : h

  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${hue.toFixed(1)})`
}

export function applyBrandColor(hex: string) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return
  const oklch = hexToOklch(hex)
  const root = document.documentElement
  root.style.setProperty("--primary", oklch)
  root.style.setProperty("--accent", oklch)
  root.style.setProperty("--ring", oklch)
  root.style.setProperty("--sidebar-primary", oklch)
  root.style.setProperty("--sidebar-ring", oklch)
  root.style.setProperty("--chart-1", oklch)
}

export function useBrandColor(color: string | null | undefined) {
  useEffect(() => {
    if (color) applyBrandColor(color)
  }, [color])
}
