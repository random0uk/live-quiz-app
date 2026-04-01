export type QuizStatus = 'lobby' | 'question' | 'answer_reveal' | 'leaderboard' | 'finished'

export interface Quiz {
  id: string
  title: string
  host_name: string
  game_code: string
  status: QuizStatus
  current_question_index: number
  theme_bg: string
  theme_btn: string
  created_at: string
}

export interface OrganizerSettings {
  id: number
  pin_code: string
  default_theme_bg: string
  default_theme_btn: string
  updated_at: string
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'poll'

export interface Question {
  id: string
  quiz_id: string
  question_text: string
  options: string[]
  correct_index: number
  time_limit: number
  position: number
  type: QuestionType
}

export interface Player {
  id: string
  quiz_id: string
  name: string
  score: number
  joined_at: string
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
