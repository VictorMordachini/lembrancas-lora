
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MemoryImage {
  id: string;
  image_url: string;
  memory_id: string;
}

export const useMemoryImages = (memoryId: string) => {
  const [memoryImages, setMemoryImages] = useState<MemoryImage[]>([]);

  const fetchMemoryImages = async () => {
    try {
      const { data: imagesData, error: imagesError } = await supabase
        .from('memory_images')
        .select('*')
        .eq('memory_id', memoryId);

      if (imagesError) throw imagesError;
      setMemoryImages(imagesData || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar imagens: ${error.message}`);
    }
  };

  const uploadNewImages = async (newImages: File[]) => {
    const uploadedUrls: string[] = [];
    
    for (const image of newImages) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${memoryId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('memory-images')
        .upload(fileName, image);

      if (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('memory-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const removeImage = async (imageId: string, imageUrl: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('memory_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Delete from storage
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('memory-images')
          .remove([`${memoryId}/${fileName}`]);

        if (storageError) {
          console.error('Erro ao deletar imagem do storage:', storageError);
        }
      }

      // Update local state
      setMemoryImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Imagem removida com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao remover imagem: ${error.message}`);
    }
  };

  const addNewImagesToMemory = async (uploadedUrls: string[]) => {
    for (const url of uploadedUrls) {
      await supabase
        .from('memory_images')
        .insert({
          memory_id: memoryId,
          image_url: url
        });
    }
  };

  return {
    memoryImages,
    setMemoryImages,
    fetchMemoryImages,
    uploadNewImages,
    removeImage,
    addNewImagesToMemory
  };
};
