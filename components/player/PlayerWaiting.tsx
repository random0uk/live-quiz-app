"use client"

interface Props {
  lastResult: { is_correct: boolean; points_earned: number } | null
  playerScore: number
}

export default function PlayerWaiting({ lastResult, playerScore }: Props) {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 gap-6">
      {lastResult !== null ? (
        <div className="flex flex-col items-center gap-5 w-full max-w-xs">
          {/* Result */}
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg text-5xl ${
            lastResult.is_correct
              ? "bg-[--answer-green] shadow-green-500/30"
              : "bg-[--answer-red] shadow-red-500/30"
          }`}>
            {lastResult.is_correct ? "✓" : "✗"}
          </div>

          <div className="text-center">
            <h2 className={`text-3xl font-black ${lastResult.is_correct ? "text-foreground" : "text-muted-foreground"}`}>
              {lastResult.is_correct ? "Correct!" : "Wrong!"}
            </h2>
            {lastResult.is_correct && (
              <p className="text-muted-foreground text-sm mt-1">
                +{lastResult.points_earned.toLocaleString()} points
              </p>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 w-full text-center">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">Your Score</p>
            <p className="text-foreground font-black text-3xl">{playerScore.toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Waiting for answer reveal...</p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
        <p className="text-muted-foreground text-sm">Waiting for host...</p>
      </div>
    </main>
  )
}
