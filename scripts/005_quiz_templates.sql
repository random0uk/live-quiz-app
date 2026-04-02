-- Quiz templates: saved question sets that persist across deployments
-- These are the organizer's reusable question banks, separate from launched quizzes

CREATE TABLE IF NOT EXISTS public.quiz_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'My Quiz',
  mode TEXT NOT NULL DEFAULT 'classic',
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quiz_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_templates_all" ON public.quiz_templates FOR ALL USING (true) WITH CHECK (true);
