
-- Update the delete_memory_with_cleanup function to use the correct storage deletion method
CREATE OR REPLACE FUNCTION public.delete_memory_with_cleanup(memory_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  memory_user_id UUID;
  image_record RECORD;
  file_path TEXT;
  storage_result RECORD;
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
    -- Delete from storage bucket using the correct method
    DELETE FROM storage.objects 
    WHERE bucket_id = 'memory-images' 
    AND name = memory_id_param::text || '/' || file_path;
  END LOOP;
  
  -- Also delete the dump image if it exists
  SELECT dump_image_url INTO file_path FROM public.memories WHERE id = memory_id_param;
  IF file_path IS NOT NULL THEN
    -- Extract filename from dump image URL
    file_path := split_part(file_path, '/', -1);
    DELETE FROM storage.objects 
    WHERE bucket_id = 'memory-images' 
    AND name = memory_id_param::text || '/' || file_path;
  END IF;
  
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
