
-- Make the memory-images bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'memory-images';

-- Remove the existing RLS policies that might conflict
DROP POLICY IF EXISTS "Users can view memory images they have access to" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload images for their memories" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete images from their memories" ON storage.objects;

-- Create new simplified RLS policies for the public bucket
CREATE POLICY "Anyone can view memory images"
ON storage.objects FOR SELECT
USING (bucket_id = 'memory-images');

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
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.memories 
    WHERE memories.id::text = split_part(name, '/', 1)
    AND memories.user_id = auth.uid()
  )
);
