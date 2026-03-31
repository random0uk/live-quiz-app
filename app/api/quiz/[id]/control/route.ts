import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { QuizStatus } from '@/lib/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { action } = await req.json()
    const supabase = await createClient()

    // Get current quiz state
    const { data: quiz, error: fetchError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Get total questions count
    const { count } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('quiz_id', id)

    const total = count ?? 0
    let update: { status?: QuizStatus; current_question_index?: number } = {}

    switch (action) {
      case 'start':
        update = { status: 'question', current_question_index: 0 }
        break
      case 'reveal':
        update = { status: 'answer_reveal' }
        break
      case 'leaderboard':
        update = { status: 'leaderboard' }
        break
      case 'next':
        const next = quiz.current_question_index + 1
        if (next >= total) {
          update = { status: 'finished' }
        } else {
          update = { status: 'question', current_question_index: next }
        }
        break
      case 'finish':
        update = { status: 'finished' }
        break
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await supabase
      .from('quizzes')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({ quiz: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
