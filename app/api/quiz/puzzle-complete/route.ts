import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { quiz_id, question_id, player_id, completion_time_ms } = await request.json()
    const supabase = await createClient()

    // Check if already completed
    const { data: existing } = await supabase
      .from("puzzle_completions")
      .select("id")
      .eq("question_id", question_id)
      .eq("player_id", player_id)
      .single()

    if (existing) {
      return NextResponse.json({ already_completed: true, points_earned: 0 })
    }

    // Count how many completed before this player (for ranking-based points)
    const { count } = await supabase
      .from("puzzle_completions")
      .select("*", { count: "exact", head: true })
      .eq("question_id", question_id)

    const position = (count ?? 0) + 1
    // 1st = 1000pts, 2nd = 800, 3rd = 600, rest = 400
    const points_map: Record<number, number> = { 1: 1000, 2: 800, 3: 600 }
    const points_earned = points_map[position] ?? 400

    // Save completion
    await supabase.from("puzzle_completions").insert({
      quiz_id,
      question_id,
      player_id,
      completion_time_ms,
      points_earned,
    })

    // Update player score
    const { data: player } = await supabase.from("players").select("score").eq("id", player_id).single()
    if (player) {
      await supabase.from("players").update({ score: player.score + points_earned }).eq("id", player_id)
    }

    return NextResponse.json({ points_earned, position })
  } catch (error) {
    console.error("Puzzle complete error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
