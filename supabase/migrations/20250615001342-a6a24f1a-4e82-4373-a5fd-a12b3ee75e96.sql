
-- Add storage bucket for memory images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-images', 'memory-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for memory-images storage bucket
CREATE POLICY "Users can view memory images they have access to"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'memory-images' 
  AND (
    -- Public memories are viewable by anyone
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id::text = split_part(storage.objects.name, '/', 1)
      AND memories.is_public = true
    )
    OR
    -- Users can view their own memory images
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

-- Create a function to safely delete a memory and all associated data
CREATE OR REPLACE FUNCTION public.delete_memory_with_cleanup(memory_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  memory_user_id UUID;
  image_record RECORD;
  file_path TEXT;
BEGIN
  -- Check if the memory exists and belongs to the current user
  SELECT user_id INTO memory_user_id 
  FROM public.memories 
  WHERE id = memory_id_param;
  
  IF memory_user_id IS NULL THEN
    RAISE EXCEPTION 'Memory not found';
  END IF;
  
  IF memory_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own memories';
  END IF;
  
  -- Delete associated images from storage
  FOR image_record IN 
    SELECT image_url FROM public.memory_images WHERE memory_id = memory_id_param
  LOOP
    -- Extract the file path from the URL
    file_path := split_part(image_record.image_url, '/', -1);
    -- Delete from storage bucket
    PERFORM storage.delete_object('memory-images', memory_id_param::text || '/' || file_path);
  END LOOP;
  
  -- Delete memory images records
  DELETE FROM public.memory_images WHERE memory_id = memory_id_param;
  
  -- Delete the memory record
  DELETE FROM public.memories WHERE id = memory_id_param AND user_id = auth.uid();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
