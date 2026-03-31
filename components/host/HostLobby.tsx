"use client"

import { Quiz, Player } from "@/lib/types"
import { Users, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  quiz: Quiz
  players: Player[]
  onStart: () => void
  controlling?: boolean
}

export default function HostLobby({ quiz, players, onStart, controlling }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
          <p className="text-muted-foreground text-sm">Lobby</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Join Code */}
          <div className="text-center p-4 bg-secondary rounded-xl">
            <p className="text-muted-foreground text-xs mb-1">Join Code</p>
            <p className="text-3xl font-mono font-bold tracking-widest text-primary">{quiz.game_code}</p>
          </div>

          {/* Players */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{players.length} player{players.length !== 1 ? "s" : ""}</span>
              </div>
              {players.length > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live
                </span>
              )}
            </div>

            {players.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {players.map((p) => (
                  <span
                    key={p.id}
                    className="px-2 py-1 bg-secondary rounded-full text-xs font-medium animate-scale-in"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-6">
                Waiting for players...
              </p>
            )}
          </div>

          {/* Start Button */}
          <Button
            onClick={onStart}
            disabled={players.length === 0 || controlling}
            className="w-full h-12 font-semibold"
          >
            {controlling ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </>
            )}
          </Button>

          {players.length === 0 && (
            <p className="text-center text-muted-foreground text-xs">
              Need at least 1 player
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
