"use client"

import { Quiz, Player, Question } from "@/lib/types"
import { Users, Play, HelpCircle, ToggleLeft, BarChart3, Zap, Target, Skull, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  quiz: Quiz
  players: Player[]
  firstQuestion?: Question
  onStart: () => void
  controlling?: boolean
}

const TYPE_ICONS = {
  multiple_choice: HelpCircle,
  true_false: ToggleLeft,
  poll: BarChart3,
}

const TYPE_LABELS = {
  multiple_choice: "Multiple Choice",
  true_false: "True / False",
  poll: "Poll",
}

const MODE_INFO = {
  classic: { icon: Zap, label: "Classic", color: "text-primary" },
  fastest_finger: { icon: Target, label: "Fastest Finger", color: "text-amber-500" },
  elimination: { icon: Skull, label: "Elimination", color: "text-destructive" },
  team: { icon: UsersRound, label: "Team Mode", color: "text-blue-500" },
}

export default function HostLobby({ quiz, players, firstQuestion, onStart, controlling }: Props) {
  const modeInfo = MODE_INFO[quiz.mode] || MODE_INFO.classic
  const ModeIcon = modeInfo.icon

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
          <div className="flex items-center justify-center gap-1.5 text-sm">
            <ModeIcon className={`w-4 h-4 ${modeInfo.color}`} />
            <span className={modeInfo.color}>{modeInfo.label}</span>
          </div>
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

          {/* Upcoming Question Preview */}
          {firstQuestion && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">UP NEXT</p>
              <div className="flex items-start gap-2">
                {(() => {
                  const Icon = TYPE_ICONS[firstQuestion.type] || HelpCircle
                  return <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                })()}
                <div className="min-w-0">
                  <p className="text-xs text-primary font-medium">{TYPE_LABELS[firstQuestion.type] || "Question"}</p>
                  <p className="text-sm font-medium truncate">{firstQuestion.question_text}</p>
                </div>
              </div>
            </div>
          )}

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
