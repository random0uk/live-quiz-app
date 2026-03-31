import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  try {
    const { title, host_name, questions } = await req.json()

    if (!title || !host_name || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const game_code = generateCode()

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({ title, host_name, game_code, status: 'lobby' })
      .select()
      .single()

    if (quizError) return NextResponse.json({ error: quizError.message }, { status: 500 })

    const questionRows = questions.map((q: { question_text: string; options: string[]; correct_index: number; time_limit: number }, idx: number) => ({
      quiz_id: quiz.id,
      question_text: q.question_text,
      options: q.options,
      correct_index: q.correct_index,
      time_limit: q.time_limit || 20,
      position: idx,
    }))

    const { error: qError } = await supabase.from('questions').insert(questionRows)
    if (qError) return NextResponse.json({ error: qError.message }, { status: 500 })

    return NextResponse.json({ quiz })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
