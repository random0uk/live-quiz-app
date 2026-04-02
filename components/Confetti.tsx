"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  shape: "rect" | "circle"
  alpha: number
}

const COLORS = [
  "#2563eb", // blue
  "#facc15", // yellow
  "#f97316", // orange
  "#22c55e", // green
  "#ec4899", // pink
  "#a855f7", // purple
  "#ffffff", // white
]

export default function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Spawn particles in bursts
    const spawn = () => {
      for (let i = 0; i < 12; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: Math.random() * 10 + 5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
          shape: Math.random() > 0.4 ? "rect" : "circle",
          alpha: 1,
        })
      }
    }

    // Burst 5 times at staggered intervals
    for (let b = 0; b < 5; b++) {
      setTimeout(spawn, b * 300)
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0.05)
      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.07 // gravity
        p.rotation += p.rotationSpeed
        if (p.y > canvas.height * 0.7) p.alpha -= 0.018
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
      particlesRef.current = []
    }
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  )
}
