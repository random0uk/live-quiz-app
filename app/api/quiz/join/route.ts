import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { game_code, player_name, avatar_url } = await req.json()

    if (!game_code || !player_name) {
      return NextResponse.json({ error: 'Missing game code or player name' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('game_code', game_code.toUpperCase())
      .single()

    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Game not found. Check the code and try again.' }, { status: 404 })
    }

    if (quiz.status !== 'lobby') {
      return NextResponse.json({ error: 'Game has already started.' }, { status: 400 })
    }

    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({ quiz_id: quiz.id, name: player_name.trim(), avatar_url: avatar_url ?? null })
      .select()
      .single()

    if (playerError) return NextResponse.json({ error: playerError.message }, { status: 500 })

    return NextResponse.json({ quiz, player })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
