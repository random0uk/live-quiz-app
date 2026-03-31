"use client"

import Link from "next/link"
import { Zap, Users, Play } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="w-10 h-10 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-5xl font-bold text-foreground tracking-tight text-balance text-center">
            QuizBlitz
          </h1>
          <p className="text-muted-foreground text-center text-balance text-lg leading-relaxed">
            Host live multiplayer quizzes. Play with friends in real time.
          </p>
        </div>

        {/* Action Cards */}
        <div className="w-full flex flex-col gap-4">
          <Link href="/join" className="group w-full">
            <div className="w-full rounded-2xl bg-primary p-5 flex items-center justify-between shadow-lg shadow-primary/25 transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-primary/35 active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary-foreground" fill="currentColor" />
                </div>
                <div>
                  <div className="text-primary-foreground font-bold text-xl">Join a Game</div>
                  <div className="text-primary-foreground/70 text-sm">Enter a game code to play</div>
                </div>
              </div>
              <div className="text-primary-foreground/60 text-2xl font-light">›</div>
            </div>
          </Link>

          <Link href="/host" className="group w-full">
            <div className="w-full rounded-2xl bg-card border border-border p-5 flex items-center justify-between transition-all duration-200 group-hover:scale-[1.02] group-hover:border-primary/50 active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Users className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <div className="text-foreground font-bold text-xl">Host a Quiz</div>
                  <div className="text-muted-foreground text-sm">Create and host a game</div>
                </div>
              </div>
              <div className="text-muted-foreground text-2xl font-light">›</div>
            </div>
          </Link>
        </div>

        <p className="text-muted-foreground text-sm text-center">
          No account needed &mdash; jump right in
        </p>
      </div>
    </main>
  )
}
