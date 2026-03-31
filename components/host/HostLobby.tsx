"use client"

import { Quiz, Player } from "@/lib/types"
import { Users, Zap, Smartphone } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface Props {
  quiz: Quiz
  players: Player[]
  onStart: () => void
}

export default function HostLobby({ quiz, players, onStart }: Props) {
  const joinUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/join?code=${quiz.game_code}`
    : `/join?code=${quiz.game_code}`

  return (
    <main 
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}15, ${quiz.theme_btn}10)` }}
    >
      {/* Header */}
      <div className="px-6 pt-8 pb-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})` }}
          >
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <span className="text-gray-600 font-semibold">QuizBlitz</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 text-center">{quiz.title}</h1>
      </div>

      {/* Join Section */}
      <div className="mx-4 lg:mx-auto lg:max-w-3xl w-full lg:w-full">
        <div 
          className="rounded-3xl p-8 shadow-2xl flex flex-col lg:flex-row items-center gap-8"
          style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})` }}
        >
          {/* QR Code */}
          <div className="bg-white p-4 rounded-2xl shadow-inner">
            <QRCodeSVG 
              value={joinUrl} 
              size={160}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Code Display */}
          <div className="flex flex-col items-center lg:items-start gap-3 text-center lg:text-left">
            <div className="flex items-center gap-2 text-white/80">
              <Smartphone className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Scan to Join or Enter Code</span>
            </div>
            <p className="text-white font-black tracking-[0.2em]" style={{ fontSize: "clamp(3rem, 12vw, 5rem)" }}>
              {quiz.game_code}
            </p>
            <p className="text-white/70 text-sm">
              Go to <span className="font-bold text-white">quizblitz.app/join</span>
            </p>
          </div>
        </div>
      </div>

      {/* Players Section */}
      <div className="flex-1 flex flex-col px-4 lg:px-0 lg:max-w-3xl lg:mx-auto lg:w-full pt-6 gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600 font-semibold">
              {players.length} player{players.length !== 1 ? "s" : ""} joined
            </span>
          </div>
          {players.length > 0 && (
            <div className="flex items-center gap-1">
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
              <span className="text-sm text-gray-500">Live</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
                style={{ backgroundColor: `${quiz.theme_bg}20` }}
              >
                <Users className="w-10 h-10" style={{ color: quiz.theme_bg }} />
              </div>
              <p className="text-gray-500 text-center">Waiting for players to scan and join...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4">
              {players.map((player, idx) => (
                <div
                  key={player.id}
                  className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold"
                    style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})` }}
                  >
                    {player.name[0].toUpperCase()}
                  </div>
                  <span className="text-gray-800 font-semibold truncate">{player.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Start Button */}
      <div className="p-4 pb-8 lg:max-w-3xl lg:mx-auto lg:w-full">
        <button
          onClick={onStart}
          disabled={players.length === 0}
          className="w-full text-white py-5 rounded-2xl font-bold text-xl shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl disabled:opacity-40 disabled:hover:scale-100 active:scale-[0.98]"
          style={{ 
            background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})`,
            boxShadow: `0 20px 40px ${quiz.theme_bg}40`
          }}
        >
          Start Game
        </button>
        {players.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-3">Waiting for at least 1 player</p>
        )}
      </div>
    </main>
  )
}
