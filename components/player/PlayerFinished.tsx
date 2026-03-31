"use client"

import { Player } from "@/lib/types"
import Link from "next/link"
import { Trophy, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  players: Player[]
  currentPlayerId: string
}

export default function PlayerFinished({ players, currentPlayerId }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const myRank = sorted.findIndex(p => p.id === currentPlayerId) + 1
  const me = sorted.find(p => p.id === currentPlayerId)

  const getRankMessage = (rank: number) => {
    if (rank === 1) return "You won!"
    if (rank <= 3) return "Top 3!"
    return "Good game!"
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xs animate-fade-in">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary flex items-center justify-center mb-2">
            <Trophy className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Game Over</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {me && (
            <div className="text-center p-4 bg-secondary rounded-xl">
              <p className="text-2xl font-bold">#{myRank}</p>
              <p className="text-muted-foreground text-sm">{getRankMessage(myRank)}</p>
              <p className="text-3xl font-bold font-mono mt-2">{me.score}</p>
              <p className="text-muted-foreground text-xs">points</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-secondary rounded-lg">
              <p className="font-bold">{myRank}</p>
              <p className="text-xs text-muted-foreground">Rank</p>
            </div>
            <div className="p-2 bg-secondary rounded-lg">
              <p className="font-bold">{me?.score || 0}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
            <div className="p-2 bg-secondary rounded-lg">
              <p className="font-bold">{players.length}</p>
              <p className="text-xs text-muted-foreground">Players</p>
            </div>
          </div>

          <Link href="/" className="block">
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
