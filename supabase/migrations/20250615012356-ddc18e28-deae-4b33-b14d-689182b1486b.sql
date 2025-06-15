
-- Create a table for custom people tags/badges that users can create
CREATE TABLE public.people_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure tag names are unique per user
  UNIQUE(user_id, name)
);

-- Create a join table to associate people tags with memories
CREATE TABLE public.memory_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  people_tag_id UUID NOT NULL REFERENCES public.people_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure a tag can only be added once per memory
  UNIQUE(memory_id, people_tag_id)
);

-- Add Row Level Security (RLS) for people_tags table
ALTER TABLE public.people_tags ENABLE ROW LEVEL SECURITY;

-- Users can view their own tags
CREATE POLICY "Users can view their own people tags" 
  ON public.people_tags 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own tags
CREATE POLICY "Users can create their own people tags" 
  ON public.people_tags 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tags
CREATE POLICY "Users can update their own people tags" 
  ON public.people_tags 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own tags
CREATE POLICY "Users can delete their own people tags" 
  ON public.people_tags 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add Row Level Security (RLS) for memory_participants table
ALTER TABLE public.memory_participants ENABLE ROW LEVEL SECURITY;

-- Users can view participants for their own memories or memories they have access to
CREATE POLICY "Users can view memory participants for accessible memories" 
  ON public.memory_participants 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.memories m 
      WHERE m.id = memory_participants.memory_id 
      AND (m.user_id = auth.uid() OR m.is_public = true)
    )
  );

-- Users can add participants to their own memories
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

-- Users can remove participants from their own memories
CREATE POLICY "Users can remove participants from their own memories" 
  ON public.memory_participants 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.memories m 
      WHERE m.id = memory_participants.memory_id 
      AND m.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_people_tags_user_id ON public.people_tags(user_id);
CREATE INDEX idx_people_tags_name ON public.people_tags(user_id, name);
CREATE INDEX idx_memory_participants_memory_id ON public.memory_participants(memory_id);
CREATE INDEX idx_memory_participants_people_tag_id ON public.memory_participants(people_tag_id);

-- Add updated_at trigger for people_tags
CREATE OR REPLACE FUNCTION public.update_people_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_people_tags_updated_at
  BEFORE UPDATE ON public.people_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_people_tags_updated_at();
