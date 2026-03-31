"use client"

import { Quiz, Player } from "@/lib/types"
import Link from "next/link"
import { Zap, Trophy, Medal, Award, Home, RotateCcw } from "lucide-react"

interface Props {
  quiz: Quiz
  players: Player[]
}

const MEDAL_ICONS = [Trophy, Medal, Award]
const MEDAL_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"]
const PODIUM_HEIGHTS = ["h-32", "h-24", "h-16"]

export default function HostFinished({ quiz, players }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const top3 = sorted.slice(0, 3)

  return (
    <main 
      className="min-h-screen flex flex-col items-center"
      style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}15, ${quiz.theme_btn}10)` }}
    >
      <div className="w-full max-w-2xl px-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 pt-10 pb-8">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})`,
              boxShadow: `0 20px 40px ${quiz.theme_bg}40`
            }}
          >
            <Zap className="w-10 h-10 text-white" fill="currentColor" />
          </div>
          <h1 className="text-5xl font-black text-gray-900">Game Over!</h1>
          <p className="text-gray-500 text-lg">{quiz.title}</p>
        </div>

        {/* Podium */}
        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-4 mb-10 h-64">
            {/* 2nd place */}
            {top3[1] && (
              <div className="flex flex-col items-center gap-3 flex-1 max-w-[140px]">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${MEDAL_COLORS[1]}30`, border: `3px solid ${MEDAL_COLORS[1]}` }}
                >
                  <span className="text-gray-700 font-black text-2xl">{top3[1].name[0].toUpperCase()}</span>
                </div>
                <span className="text-gray-800 font-bold text-sm text-center truncate w-full">{top3[1].name}</span>
                <span className="text-gray-500 font-black">{top3[1].score.toLocaleString()}</span>
                <div 
                  className={`w-full ${PODIUM_HEIGHTS[1]} rounded-t-2xl flex items-center justify-center shadow-lg`}
                  style={{ backgroundColor: MEDAL_COLORS[1] }}
                >
                  <Medal className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
            
            {/* 1st place */}
            {top3[0] && (
              <div className="flex flex-col items-center gap-3 flex-1 max-w-[160px]">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
                  style={{ backgroundColor: `${MEDAL_COLORS[0]}30`, border: `4px solid ${MEDAL_COLORS[0]}` }}
                >
                  <span className="text-gray-800 font-black text-3xl">{top3[0].name[0].toUpperCase()}</span>
                </div>
                <span className="text-gray-900 font-black text-lg text-center truncate w-full">{top3[0].name}</span>
                <span style={{ color: quiz.theme_bg }} className="font-black text-xl">{top3[0].score.toLocaleString()}</span>
                <div 
                  className={`w-full ${PODIUM_HEIGHTS[0]} rounded-t-2xl flex items-center justify-center shadow-xl`}
                  style={{ backgroundColor: MEDAL_COLORS[0] }}
                >
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              </div>
            )}
            
            {/* 3rd place */}
            {top3[2] && (
              <div className="flex flex-col items-center gap-3 flex-1 max-w-[140px]">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${MEDAL_COLORS[2]}30`, border: `3px solid ${MEDAL_COLORS[2]}` }}
                >
                  <span className="text-gray-700 font-black text-2xl">{top3[2].name[0].toUpperCase()}</span>
                </div>
                <span className="text-gray-800 font-bold text-sm text-center truncate w-full">{top3[2].name}</span>
                <span className="text-gray-500 font-black">{top3[2].score.toLocaleString()}</span>
                <div 
                  className={`w-full ${PODIUM_HEIGHTS[2]} rounded-t-2xl flex items-center justify-center shadow-lg`}
                  style={{ backgroundColor: MEDAL_COLORS[2] }}
                >
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full leaderboard */}
        {sorted.length > 3 && (
          <div className="bg-white rounded-3xl p-6 mb-8 shadow-xl">
            <h3 className="text-gray-900 font-bold text-lg mb-4">All Players</h3>
            <div className="flex flex-col gap-3">
              {sorted.map((player, idx) => (
                <div key={player.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-400 text-sm w-6 text-right font-black">{idx + 1}</span>
                  <span className="text-gray-800 font-semibold flex-1 truncate">{player.name}</span>
                  <span className="text-gray-700 font-black">{player.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-10">
          <Link href="/organizer">
            <button 
              className="w-full text-white py-5 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-[0.98]"
              style={{ 
                background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})`,
                boxShadow: `0 20px 40px ${quiz.theme_bg}40`
              }}
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          </Link>
          <Link href="/">
            <button className="w-full bg-white text-gray-700 py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-[0.98] border border-gray-200">
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
