import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { quiz_id, question_id, player_id, selected_index, time_remaining, time_limit } = await req.json()

    if (quiz_id == null || question_id == null || player_id == null || selected_index == null) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch quiz mode and question info
    const [{ data: quiz }, { data: question }, { data: player }] = await Promise.all([
      supabase.from('quizzes').select('mode').eq('id', quiz_id).single(),
      supabase.from('questions').select('correct_index, time_limit, type').eq('id', question_id).single(),
      supabase.from('players').select('id, team, eliminated').eq('id', player_id).single()
    ])

    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

    // If player is eliminated, they can't answer
    if (player.eliminated) {
      return NextResponse.json({ error: 'Player is eliminated', is_correct: false, points_earned: 0, eliminated: true })
    }

    const mode = quiz?.mode ?? 'classic'
    const questionType = question.type ?? 'multiple_choice'
    const isPoll = questionType === 'poll'
    const is_correct = isPoll ? false : selected_index === question.correct_index
    const tl = time_limit ?? question.time_limit ?? 20
    const tr = time_remaining ?? 0

    // Count existing correct answers for this question (for fastest finger)
    let answer_order: number | null = null
    if (mode === 'fastest_finger' && is_correct) {
      const { count } = await supabase
        .from('answers')
        .select('id', { count: 'exact', head: true })
        .eq('question_id', question_id)
        .eq('is_correct', true)
      answer_order = (count ?? 0) + 1
    }

    // Calculate points based on mode
    let points_earned = 0
    if (!isPoll && is_correct) {
      const basePoints = Math.max(200, Math.round(1000 * (tr / tl)))
      
      switch (mode) {
        case 'fastest_finger':
          // Only first correct answer gets full points
          points_earned = answer_order === 1 ? basePoints : 0
          break
        case 'elimination':
          // Standard points for correct
          points_earned = basePoints
          break
        case 'team':
          // Standard points (will also update team score)
          points_earned = basePoints
          break
        default: // classic
          points_earned = basePoints
      }
    }

    // Insert answer
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .upsert(
        { quiz_id, question_id, player_id, selected_index, is_correct, points_earned, answer_order },
        { onConflict: 'question_id,player_id' }
      )
      .select()
      .single()

    if (answerError) return NextResponse.json({ error: answerError.message }, { status: 500 })

    // Update player score
    if (points_earned > 0) {
      await supabase.rpc('increment_score', { p_player_id: player_id, p_points: points_earned })
    }

    // Handle elimination mode — wrong answer = eliminated
    let eliminated = false
    if (mode === 'elimination' && !is_correct && !isPoll) {
      await supabase.from('players').update({ eliminated: true }).eq('id', player_id)
      eliminated = true
    }

    // Update team score in team mode
    if (mode === 'team' && player.team && points_earned > 0) {
      await supabase.rpc('increment_team_score', { p_team_name: player.team, p_quiz_id: quiz_id, p_points: points_earned })
    }

    return NextResponse.json({ 
      answer, 
      is_correct, 
      points_earned, 
      is_poll: isPoll,
      eliminated,
      answer_order,
      mode
    })
  } catch (e) {
    console.error('Answer API error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
