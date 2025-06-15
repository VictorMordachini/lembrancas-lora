
-- Update RLS policies for memories table to ensure proper access control
-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view public memories" ON public.memories;
DROP POLICY IF EXISTS "Users can view their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can create their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can update their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can delete their own memories" ON public.memories;

-- Create comprehensive RLS policies
-- Allow anyone to view public memories
CREATE POLICY "Anyone can view public memories" 
  ON public.memories 
  FOR SELECT 
  USING (is_public = true);

-- Allow users to view their own memories (both public and private)
CREATE POLICY "Users can view their own memories" 
  ON public.memories 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to create their own memories
CREATE POLICY "Users can create their own memories" 
  ON public.memories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own memories
CREATE POLICY "Users can update their own memories" 
  ON public.memories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete their own memories
CREATE POLICY "Users can delete their own memories" 
  ON public.memories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for memory_images table to follow the same pattern
ALTER TABLE public.memory_images ENABLE ROW LEVEL SECURITY;

-- Policy for viewing memory images - can view if they can view the associated memory
CREATE POLICY "Users can view memory images they have access to" 
  ON public.memory_images 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_images.memory_id 
      AND (memories.is_public = true OR memories.user_id = auth.uid())
    )
  );

-- Policy for creating memory images - can create if they own the memory
CREATE POLICY "Users can create images for their memories" 
  ON public.memory_images 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_images.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

-- Policy for updating memory images - can update if they own the memory
CREATE POLICY "Users can update images for their memories" 
  ON public.memory_images 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_images.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

-- Policy for deleting memory images - can delete if they own the memory
CREATE POLICY "Users can delete images for their memories" 
  ON public.memory_images 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_images.memory_id 
      AND memories.user_id = auth.uid()
    )
  );
