"use client"

import { Card, CardContent } from "@/components/ui/card"
import { XCircle } from "lucide-react"

export default function PlayerEliminated() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xs animate-scale-in">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <p className="text-xl font-bold text-destructive">Eliminated!</p>
            <p className="text-muted-foreground text-sm mt-1">Better luck next time</p>
          </div>
          <p className="text-muted-foreground text-xs">
            You can still watch the game on the projector screen
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
