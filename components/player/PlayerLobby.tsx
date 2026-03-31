"use client"

import { Quiz, Player } from "@/lib/types"
import { Zap } from "lucide-react"

interface Props {
  quiz: Quiz
  player: Player
}

export default function PlayerLobby({ quiz, player }: Props) {
  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center px-4 gap-8"
      style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}15, ${quiz.theme_btn}10)` }}
    >
      <div className="flex flex-col items-center gap-4">
        <div 
          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl"
          style={{ 
            background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})`,
            boxShadow: `0 20px 40px ${quiz.theme_bg}40`
          }}
        >
          <Zap className="w-10 h-10 text-white" fill="currentColor" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 text-balance text-center">{quiz.title}</h1>
      </div>

      {/* Player card */}
      <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 w-full max-w-xs shadow-xl">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})`,
          }}
        >
          <span className="text-white font-black text-4xl">{player.name[0].toUpperCase()}</span>
        </div>
        <div className="text-center">
          <p className="text-gray-900 font-black text-2xl">{player.name}</p>
          <p className="text-gray-500 text-sm mt-1">You&apos;re in the game!</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white/80 rounded-full px-5 py-3 shadow-lg">
        <span className="relative flex h-3 w-3">
          <span 
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: quiz.theme_bg }}
          />
          <span 
            className="relative inline-flex rounded-full h-3 w-3"
            style={{ backgroundColor: quiz.theme_bg }}
          />
        </span>
        <p className="text-gray-600 font-medium">Waiting for host to start...</p>
      </div>
    </main>
  )
}
