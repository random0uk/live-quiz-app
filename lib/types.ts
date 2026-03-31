export type QuizStatus = 'lobby' | 'question' | 'answer_reveal' | 'leaderboard' | 'finished'

export interface Quiz {
  id: string
  title: string
  host_name: string
  game_code: string
  status: QuizStatus
  current_question_index: number
  created_at: string
}

export interface Question {
  id: string
  quiz_id: string
  question_text: string
  options: string[]
  correct_index: number
  time_limit: number
  position: number
  created_at: string
}

export interface Player {
  id: string
  quiz_id: string
  name: string
  score: number
  created_at: string
}

export interface Answer {
  id: string
  quiz_id: string
  question_id: string
  player_id: string
  selected_index: number
  is_correct: boolean
  points_earned: number
  answered_at: string
}
