
-- First, let's ensure RLS is enabled on all tables
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate all policies to ensure consistency
DROP POLICY IF EXISTS "Users can view their own memories and public memories" ON public.memories;
DROP POLICY IF EXISTS "Users can view their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can insert their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can create their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can update their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can delete their own memories" ON public.memories;
DROP POLICY IF EXISTS "Anyone can view public memories" ON public.memories;

-- Comprehensive RLS policies for memories table
CREATE POLICY "Users can view their own memories and public memories" 
  ON public.memories 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own memories" 
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

-- Drop all existing memory_images policies
DROP POLICY IF EXISTS "Users can view images of accessible memories" ON public.memory_images;
DROP POLICY IF EXISTS "Users can view images of their own memories" ON public.memory_images;
DROP POLICY IF EXISTS "Users can insert images to their own memories" ON public.memory_images;
DROP POLICY IF EXISTS "Users can add images to their own memories" ON public.memory_images;
DROP POLICY IF EXISTS "Users can create images for their memories" ON public.memory_images;
DROP POLICY IF EXISTS "Users can update images of their own memories" ON public.memory_images;
DROP POLICY IF EXISTS "Users can update images for their memories" ON public.memory_images;
DROP POLICY IF EXISTS "Users can delete images of their own memories" ON public.memory_images;
DROP POLICY IF EXISTS "Users can delete images for their memories" ON public.memory_images;
DROP POLICY IF EXISTS "Users can view memory images they have access to" ON public.memory_images;

-- RLS policies for memory_images
CREATE POLICY "Users can view images of accessible memories" 
  ON public.memory_images 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_images.memory_id 
      AND (memories.user_id = auth.uid() OR memories.is_public = true)
    )
  );

CREATE POLICY "Users can add images to their own memories" 
  ON public.memory_images 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_images.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images of their own memories" 
  ON public.memory_images 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_images.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images of their own memories" 
  ON public.memory_images 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_images.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

-- Drop all existing people_tags policies
DROP POLICY IF EXISTS "Users can view their own people tags" ON public.people_tags;
DROP POLICY IF EXISTS "Users can create their own people tags" ON public.people_tags;
DROP POLICY IF EXISTS "Users can update their own people tags" ON public.people_tags;
DROP POLICY IF EXISTS "Users can delete their own people tags" ON public.people_tags;

-- RLS policies for people_tags
CREATE POLICY "Users can view their own people tags" 
  ON public.people_tags 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own people tags" 
  ON public.people_tags 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own people tags" 
  ON public.people_tags 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own people tags" 
  ON public.people_tags 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Drop all existing memory_participants policies
DROP POLICY IF EXISTS "Users can view participants of their own memories" ON public.memory_participants;
DROP POLICY IF EXISTS "Users can view participants of accessible memories" ON public.memory_participants;
DROP POLICY IF EXISTS "Users can add participants to their own memories" ON public.memory_participants;
DROP POLICY IF EXISTS "Users can update participants of their own memories" ON public.memory_participants;
DROP POLICY IF EXISTS "Users can delete participants from their own memories" ON public.memory_participants;

-- RLS policies for memory_participants
CREATE POLICY "Users can view participants of accessible memories" 
  ON public.memory_participants 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_participants.memory_id 
      AND (memories.user_id = auth.uid() OR memories.is_public = true)
    )
  );

CREATE POLICY "Users can add participants to their own memories" 
  ON public.memory_participants 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_participants.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update participants of their own memories" 
  ON public.memory_participants 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_participants.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete participants from their own memories" 
  ON public.memory_participants 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_participants.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

-- Drop all existing profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Ensure storage bucket is private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'memory-images';

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Users can view memory images they have access to" ON storage.objects;
DROP POLICY IF EXISTS "Users can view accessible memory images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload images for their memories" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete images from their memories" ON storage.objects;

-- Storage RLS policies
CREATE POLICY "Users can view accessible memory images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'memory-images' 
  AND (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id::text = split_part(storage.objects.name, '/', 1)
      AND memories.is_public = true
    )
    OR
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id::text = split_part(storage.objects.name, '/', 1)
      AND memories.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can upload images for their memories"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'memory-images'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.memories 
    WHERE memories.id::text = split_part(name, '/', 1)
    AND memories.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete images from their memories"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'memory-images'
  AND EXISTS (
    SELECT 1 FROM public.memories 
    WHERE memories.id::text = split_part(name, '/', 1)
    AND memories.user_id = auth.uid()
  )
);
