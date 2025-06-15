
-- Add foreign key relationship between memories.user_id and profiles.id
ALTER TABLE public.memories 
ADD CONSTRAINT fk_memories_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
