
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMemoryImages } from '@/hooks/useMemoryImages';
import { useMemoryCollage } from '@/hooks/useMemoryCollage';
import { toast } from 'sonner';

interface Memory {
  id: string;
  title: string;
  description: string | null;
  memory_date: string;
  music_url: string | null;
  dump_image_url: string | null;
  created_at: string;
  is_favorite: boolean;
  is_public: boolean;
}

export const useMemoryEdit = (memoryId: string) => {
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const { memoryImages, setMemoryImages, fetchMemoryImages, uploadNewImages, removeImage, addNewImagesToMemory } = useMemoryImages(memoryId);
  const { createCollage } = useMemoryCollage();

  const fetchMemory = async () => {
    try {
      const { data: memoryData, error: memoryError } = await supabase
        .from('memories')
        .select('*')
        .eq('id', memoryId)
        .single();

      if (memoryError) throw memoryError;
      setMemory(memoryData);

      await fetchMemoryImages();
    } catch (error: any) {
      toast.error(`Erro ao carregar memória: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateMemory = async (
    title: string,
    description: string,
    memoryDate: string,
    musicUrl: string,
    isPublic: boolean,
    isFavorite: boolean,
    newImages: File[]
  ) => {
    if (!user || !memory) return false;

    setUpdating(true);

    try {
      // Upload new images
      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        toast.info('Fazendo upload das novas imagens...');
        uploadedUrls = await uploadNewImages(newImages);
        
        // Add new images to database
        await addNewImagesToMemory(uploadedUrls);
      }

      // Create new collage if there are images
      let finalDumpImageUrl = memory.dump_image_url;
      const allImages = [...memoryImages.map(img => img.image_url), ...uploadedUrls];
      
      if (allImages.length > 0) {
        finalDumpImageUrl = await createCollage(allImages, memoryId, title);
      }

      // Update memory using the database function
      const { error } = await supabase.rpc('update_memory_with_images', {
        memory_id_param: memoryId,
        title_param: title.trim(),
        description_param: description.trim() || null,
        memory_date_param: memoryDate,
        music_url_param: musicUrl.trim() || null,
        is_public_param: isPublic,
        is_favorite_param: isFavorite,
        dump_image_url_param: finalDumpImageUrl
      });

      if (error) throw error;

      // Refresh data
      await fetchMemory();
      toast.success('Memória atualizada com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar memória:', error);
      toast.error(`Erro ao atualizar memória: ${error.message}`);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (memoryId && user) {
      fetchMemory();
    }
  }, [memoryId, user]);

  return {
    memory,
    memoryImages,
    loading,
    updating,
    updateMemory,
    removeImage,
    fetchMemory
  };
};
