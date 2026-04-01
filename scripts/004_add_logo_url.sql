-- Add logo_url column to organizer_settings table
ALTER TABLE public.organizer_settings
  ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;
