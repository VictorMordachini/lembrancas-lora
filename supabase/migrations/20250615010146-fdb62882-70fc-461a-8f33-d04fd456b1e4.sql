
-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can insert their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can update their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can delete their own memories" ON public.memories;

-- Drop existing policies for memory_images if they exist
DROP POLICY IF EXISTS "Users can view images of their own memories" ON public.memory_images;
DROP POLICY IF EXISTS "Users can insert images to their own memories" ON public.memory_images;
DROP POLICY IF EXISTS "Users can update images of their own memories" ON public.memory_images;
DROP POLICY IF EXISTS "Users can delete images of their own memories" ON public.memory_images;

-- Create RLS policies for memories table
CREATE POLICY "Users can view their own memories" 
  ON public.memories 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories" 
  ON public.memories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" 
  ON public.memories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" 
  ON public.memories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for memory_images table
CREATE POLICY "Users can view images of their own memories" 
  ON public.memory_images 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.memories 
    WHERE memories.id = memory_images.memory_id 
    AND memories.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert images to their own memories" 
  ON public.memory_images 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.memories 
    WHERE memories.id = memory_images.memory_id 
    AND memories.user_id = auth.uid()
  ));

CREATE POLICY "Users can update images of their own memories" 
  ON public.memory_images 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.memories 
    WHERE memories.id = memory_images.memory_id 
    AND memories.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete images of their own memories" 
  ON public.memory_images 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.memories 
    WHERE memories.id = memory_images.memory_id 
    AND memories.user_id = auth.uid()
  ));

-- Enable RLS on both tables (will not error if already enabled)
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_images ENABLE ROW LEVEL SECURITY;

-- Create function to update memory with image management
CREATE OR REPLACE FUNCTION public.update_memory_with_images(
  memory_id_param UUID,
  title_param TEXT,
  description_param TEXT,
  memory_date_param DATE,
  music_url_param TEXT,
  is_public_param BOOLEAN,
  is_favorite_param BOOLEAN,
  dump_image_url_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the memory exists and belongs to the current user
  IF NOT EXISTS (
    SELECT 1 FROM public.memories 
    WHERE id = memory_id_param AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Memory not found or access denied';
  END IF;
  
  -- Update the memory
  UPDATE public.memories 
  SET 
    title = title_param,
    description = description_param,
    memory_date = memory_date_param,
    music_url = music_url_param,
    is_public = is_public_param,
    is_favorite = is_favorite_param,
    dump_image_url = dump_image_url_param,
    updated_at = now()
  WHERE id = memory_id_param AND user_id = auth.uid();
  
  RETURN TRUE;
END;
$$;
