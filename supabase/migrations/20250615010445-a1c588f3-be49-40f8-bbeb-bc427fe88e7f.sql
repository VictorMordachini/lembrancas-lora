
-- Drop the existing SELECT policy and create a new one that allows viewing public memories
DROP POLICY IF EXISTS "Users can view their own memories" ON public.memories;

-- Create a new policy that allows users to view their own memories AND public memories from others
CREATE POLICY "Users can view their own memories and public memories" 
  ON public.memories 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

-- Also update the memory_images policy to allow viewing images of public memories
DROP POLICY IF EXISTS "Users can view images of their own memories" ON public.memory_images;

CREATE POLICY "Users can view images of accessible memories" 
  ON public.memory_images 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.memories 
    WHERE memories.id = memory_images.memory_id 
    AND (memories.user_id = auth.uid() OR memories.is_public = true)
  ));
