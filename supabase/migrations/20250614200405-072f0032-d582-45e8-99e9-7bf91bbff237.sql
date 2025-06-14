
-- Add is_favorite column to memories table
ALTER TABLE public.memories 
ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT false;
