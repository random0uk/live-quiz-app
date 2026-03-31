"use client"

import { Player, Quiz } from "@/lib/types"
import { Trophy, Medal, Award } from "lucide-react"

interface Props {
  quiz: Quiz
  players: Player[]
  currentPlayerId: string
}

const MEDAL_ICONS = [Trophy, Medal, Award]
const MEDAL_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"]

export default function PlayerLeaderboard({ quiz, players, currentPlayerId }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const myRank = sorted.findIndex(p => p.id === currentPlayerId) + 1
  const me = sorted.find(p => p.id === currentPlayerId)
  const maxScore = sorted[0]?.score || 1

  return (
    <main 
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}15, ${quiz.theme_btn}10)` }}
    >
      <div className="px-4 py-5 flex items-center justify-center">
        <div 
          className="px-5 py-2 rounded-xl text-white font-bold shadow-lg"
          style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})` }}
        >
          Leaderboard
        </div>
      </div>

      {/* My rank card */}
      {me && (
        <div 
          className="mx-4 rounded-2xl p-5 flex items-center justify-between shadow-xl mb-5"
          style={{ 
            background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})`,
            boxShadow: `0 15px 30px ${quiz.theme_bg}40`
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-black text-xl">{me.name[0].toUpperCase()}</span>
            </div>
            <div>
              <p className="text-white font-bold">{me.name}</p>
              <p className="text-white/70 text-sm">Rank #{myRank}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-3xl">{me.score.toLocaleString()}</p>
            <p className="text-white/70 text-xs">points</p>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 flex flex-col gap-3 overflow-y-auto pb-8">
        {sorted.slice(0, 10).map((player, idx) => {
          const isMe = player.id === currentPlayerId
          const barPct = (player.score / maxScore) * 100
          const MedalIcon = idx < 3 ? MEDAL_ICONS[idx] : null
          
          return (
            <div
              key={player.id}
              className={`bg-white rounded-2xl px-4 py-4 flex items-center gap-4 shadow-lg transition-all animate-in fade-in slide-in-from-right-3 duration-400 ${
                isMe ? "ring-2" : ""
              }`}
              style={{ 
                animationDelay: `${idx * 60}ms`,
                ringColor: isMe ? quiz.theme_bg : undefined
              }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: idx < 3 ? `${MEDAL_COLORS[idx]}20` : "#f3f4f6" }}
              >
                {MedalIcon ? (
                  <MedalIcon className="w-5 h-5" style={{ color: MEDAL_COLORS[idx] }} />
                ) : (
                  <span className="font-black text-gray-400">{idx + 1}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold truncate ${isMe ? "" : "text-gray-800"}`} style={{ color: isMe ? quiz.theme_bg : undefined }}>
                    {player.name} {isMe && "(you)"}
                  </span>
                  <span className="font-black ml-2 shrink-0 text-gray-900">
                    {player.score.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ 
                      width: `${barPct}%`, 
                      transitionDelay: `${idx * 60 + 200}ms`,
                      background: isMe ? `linear-gradient(90deg, ${quiz.theme_bg}, ${quiz.theme_btn})` : "#d1d5db"
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
