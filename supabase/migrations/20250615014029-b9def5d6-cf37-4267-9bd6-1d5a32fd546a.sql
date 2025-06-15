
-- Remove the view for participant memory statistics
DROP VIEW IF EXISTS public.participant_memory_stats;

-- Remove the index for shared tags
DROP INDEX IF EXISTS idx_people_tags_shared;

-- Remove the updated policies
DROP POLICY IF EXISTS "Users can view their own and shared people tags" ON public.people_tags;
DROP POLICY IF EXISTS "Users can add participants to their own memories" ON public.memory_participants;

-- Restore original policies
CREATE POLICY "Users can view their own people tags" 
  ON public.people_tags 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add participants to their own memories" 
  ON public.memory_participants 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memories m 
      WHERE m.id = memory_participants.memory_id 
      AND m.user_id = auth.uid()
    )
  );

-- Remove the is_shared column from people_tags table
ALTER TABLE public.people_tags 
DROP COLUMN IF EXISTS is_shared;
