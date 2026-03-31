"use client"

import { Player } from "@/lib/types"
import Link from "next/link"
import { Trophy, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  players: Player[]
}

export default function HostFinished({ players }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const top3 = sorted.slice(0, 3)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary flex items-center justify-center mb-2">
            <Trophy className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Game Over</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Top 3 */}
          <div className="space-y-2">
            {top3.map((player, i) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? "bg-primary-foreground/20" : "bg-background"
                }`}>
                  {i === 0 ? "1st" : i === 1 ? "2nd" : "3rd"}
                </span>
                <span className="flex-1 font-semibold truncate">{player.name}</span>
                <span className="font-mono font-bold">{player.score}</span>
              </div>
            ))}
          </div>

          {/* Rest */}
          {sorted.length > 3 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {sorted.slice(3).map((player, i) => (
                <div key={player.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-5">{i + 4}.</span>
                    <span className="truncate">{player.name}</span>
                  </div>
                  <span className="font-mono text-muted-foreground">{player.score}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Link href="/organizer" className="block">
              <Button className="w-full">
                Play Again
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="secondary" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
