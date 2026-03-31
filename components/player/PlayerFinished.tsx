"use client"

import { Quiz, Player } from "@/lib/types"
import Link from "next/link"
import { Zap, RotateCcw, Trophy, Medal, Award } from "lucide-react"

interface Props {
  quiz: Quiz
  players: Player[]
  currentPlayerId: string
}

const MEDAL_ICONS = [Trophy, Medal, Award]
const MEDAL_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"]

export default function PlayerFinished({ quiz, players, currentPlayerId }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const myRank = sorted.findIndex(p => p.id === currentPlayerId) + 1
  const me = sorted.find(p => p.id === currentPlayerId)
  const total = sorted.length

  const getRankMessage = (rank: number, total: number) => {
    if (rank === 1) return "You won the game!"
    if (rank <= 3) return "Amazing! Top 3 finish!"
    if (rank <= Math.ceil(total / 2)) return "Great performance!"
    return "Good effort! Try again!"
  }

  const MedalIcon = myRank <= 3 ? MEDAL_ICONS[myRank - 1] : null

  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center px-4 gap-8"
      style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}15, ${quiz.theme_btn}10)` }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Icon */}
        <div 
          className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})`,
            boxShadow: `0 20px 40px ${quiz.theme_bg}40`
          }}
        >
          <Zap className="w-12 h-12 text-white" fill="currentColor" />
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900">Game Over!</h1>
          <p className="text-gray-500 mt-1">{quiz.title}</p>
        </div>

        {/* My result */}
        {me && (
          <div className="bg-white rounded-3xl p-8 w-full flex flex-col items-center gap-5 shadow-xl">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ 
                background: myRank <= 3 ? `${MEDAL_COLORS[myRank - 1]}30` : `${quiz.theme_bg}20`,
                border: `3px solid ${myRank <= 3 ? MEDAL_COLORS[myRank - 1] : quiz.theme_bg}`
              }}
            >
              {MedalIcon ? (
                <MedalIcon className="w-10 h-10" style={{ color: MEDAL_COLORS[myRank - 1] }} />
              ) : (
                <span className="font-black text-3xl" style={{ color: quiz.theme_bg }}>{me.name[0].toUpperCase()}</span>
              )}
            </div>
            <div className="text-center">
              <p className="text-gray-900 font-black text-2xl">{me.name}</p>
              <p className="text-gray-500 text-sm mt-1">{getRankMessage(myRank, total)}</p>
            </div>
            <div className="flex w-full justify-around border-t border-gray-100 pt-5">
              <div className="text-center">
                <p className="font-black text-3xl" style={{ color: quiz.theme_bg }}>{me.score.toLocaleString()}</p>
                <p className="text-gray-400 text-xs font-medium">Points</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div className="text-center">
                <p className="text-gray-900 font-black text-3xl">#{myRank}</p>
                <p className="text-gray-400 text-xs font-medium">Rank</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div className="text-center">
                <p className="text-gray-900 font-black text-3xl">{total}</p>
                <p className="text-gray-400 text-xs font-medium">Players</p>
              </div>
            </div>
          </div>
        )}

        <Link href="/join" className="w-full">
          <button 
            className="w-full text-white py-5 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-[0.98]"
            style={{ 
              background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})`,
              boxShadow: `0 15px 30px ${quiz.theme_bg}40`
            }}
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </Link>
      </div>
    </main>
  )
}
