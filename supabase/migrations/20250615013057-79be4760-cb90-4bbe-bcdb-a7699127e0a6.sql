
-- Add is_shared column to people_tags table
ALTER TABLE public.people_tags 
ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policies to allow viewing shared tags from other users
DROP POLICY IF EXISTS "Users can view their own people tags" ON public.people_tags;

CREATE POLICY "Users can view their own and shared people tags" 
  ON public.people_tags 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_shared = true);

-- Add policy for users to use shared tags in their memories
DROP POLICY IF EXISTS "Users can add participants to their own memories" ON public.memory_participants;

CREATE POLICY "Users can add participants to their own memories" 
  ON public.memory_participants 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memories m 
      WHERE m.id = memory_participants.memory_id 
      AND m.user_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM public.people_tags pt
      WHERE pt.id = memory_participants.people_tag_id
      AND (pt.user_id = auth.uid() OR pt.is_shared = true)
    )
  );

-- Create index for shared tags
CREATE INDEX idx_people_tags_shared ON public.people_tags(is_shared) WHERE is_shared = true;

-- Create a view for participant memory statistics (useful for profiles)
CREATE OR REPLACE VIEW public.participant_memory_stats AS
SELECT 
  pt.id as people_tag_id,
  pt.name,
  pt.avatar_url,
  pt.user_id as tag_owner_id,
  pt.is_shared,
  COUNT(DISTINCT mp.memory_id) as total_memories,
  COUNT(DISTINCT CASE WHEN m.is_public = true THEN mp.memory_id END) as public_memories
FROM public.people_tags pt
LEFT JOIN public.memory_participants mp ON pt.id = mp.people_tag_id
LEFT JOIN public.memories m ON mp.memory_id = m.id
GROUP BY pt.id, pt.name, pt.avatar_url, pt.user_id, pt.is_shared;

-- Add RLS to the view
ALTER VIEW public.participant_memory_stats SET (security_invoker = true);
