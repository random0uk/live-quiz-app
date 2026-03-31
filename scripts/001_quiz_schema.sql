-- QuizBlitz Schema

-- Quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  time_limit INT NOT NULL DEFAULT 20,
  position INT NOT NULL DEFAULT 0
);

-- Game sessions
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  room_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby','active','finished')),
  current_question_index INT NOT NULL DEFAULT -1,
  question_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Players
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- Answers
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A','B','C','D')),
  is_correct BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, question_id)
);

-- RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_quizzes" ON public.quizzes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_sessions" ON public.game_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_players" ON public.players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_answers" ON public.answers FOR ALL USING (true) WITH CHECK (true);
