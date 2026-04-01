import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { quiz_id, question_id, player_id, selected_index, time_remaining, time_limit } = await req.json()

    if (quiz_id == null || question_id == null || player_id == null || selected_index == null) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: question, error: qError } = await supabase
      .from('questions')
      .select('correct_index, time_limit, type')
      .eq('id', question_id)
      .single()

    if (qError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const questionType = question.type ?? 'multiple_choice'
    const isPoll = questionType === 'poll'

    // Polls have no correct answer — everyone gets 0 points
    const is_correct = isPoll ? false : selected_index === question.correct_index
    const tl = time_limit ?? question.time_limit ?? 20
    const tr = time_remaining ?? 0
    const points_earned = isPoll ? 0 : (is_correct ? Math.max(200, Math.round(1000 * (tr / tl))) : 0)

    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .upsert(
        { quiz_id, question_id, player_id, selected_index, is_correct, points_earned },
        { onConflict: 'question_id,player_id' }
      )
      .select()
      .single()

    if (answerError) return NextResponse.json({ error: answerError.message }, { status: 500 })

    if (is_correct && points_earned > 0) {
      await supabase.rpc('increment_score', { p_player_id: player_id, p_points: points_earned })
    }

    return NextResponse.json({ answer, is_correct, points_earned, is_poll: isPoll })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
