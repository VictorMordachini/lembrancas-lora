
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

interface MemoryImage {
  id: string;
  image_url: string;
  memory_id: string;
}

interface PeopleTag {
  id: string;
  name: string;
  avatar_url: string | null;
}

export const useMemoryEdit = (memoryId: string) => {
  const [memory, setMemory] = useState<Memory | null>(null);
  const [memoryImages, setMemoryImages] = useState<MemoryImage[]>([]);
  const [participants, setParticipants] = useState<PeopleTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  const fetchMemory = async () => {
    try {
      const { data: memoryData, error: memoryError } = await supabase
        .from('memories')
        .select('*')
        .eq('id', memoryId)
        .single();

      if (memoryError) throw memoryError;
      setMemory(memoryData);

      const { data: imagesData, error: imagesError } = await supabase
        .from('memory_images')
        .select('*')
        .eq('memory_id', memoryId);

      if (imagesError) throw imagesError;
      setMemoryImages(imagesData || []);

      // Fetch memory participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('memory_participants')
        .select(`
          people_tags (
            id,
            name,
            avatar_url
          )
        `)
        .eq('memory_id', memoryId);

      if (participantsError) throw participantsError;
      
      const peopleTagsData = participantsData
        ?.map(item => item.people_tags)
        .filter(Boolean) as PeopleTag[];

      setParticipants(peopleTagsData || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar memória: ${error.message}`);
    } finally {
      setLoading(false);
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

  const updateMemoryParticipants = async (selectedTags: PeopleTag[]) => {
    try {
      // First, remove all existing participants
      await supabase
        .from('memory_participants')
        .delete()
        .eq('memory_id', memoryId);

      // Then add new participants
      if (selectedTags.length > 0) {
        const participantsToInsert = selectedTags.map(tag => ({
          memory_id: memoryId,
          people_tag_id: tag.id
        }));

        const { error } = await supabase
          .from('memory_participants')
          .insert(participantsToInsert);

        if (error) throw error;
      }

      setParticipants(selectedTags);
    } catch (error: any) {
      toast.error(`Erro ao atualizar participantes: ${error.message}`);
      throw error;
    }
  };

  const updateMemory = async (
    title: string,
    description: string,
    memoryDate: string,
    musicUrl: string,
    isPublic: boolean,
    isFavorite: boolean,
    newImages: File[],
    selectedParticipants: PeopleTag[]
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
        for (const url of uploadedUrls) {
          await supabase
            .from('memory_images')
            .insert({
              memory_id: memoryId,
              image_url: url
            });
        }
      }

      // Create new collage if there are images
      let finalDumpImageUrl = memory.dump_image_url;
      const allImages = [...memoryImages.map(img => img.image_url), ...uploadedUrls];
      
      if (allImages.length > 0) {
        try {
          const { data, error } = await supabase.functions.invoke('create-memory-collage', {
            body: { 
              imageUrls: allImages, 
              memoryId, 
              title 
            }
          });

          if (!error && data?.collageUrl) {
            finalDumpImageUrl = data.collageUrl;
            toast.success('Colagem atualizada com sucesso!');
          }
        } catch (error) {
          console.error('Erro ao criar colagem:', error);
          // Use first image if collage creation fails
          finalDumpImageUrl = allImages[0];
        }
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

      // Update participants
      await updateMemoryParticipants(selectedParticipants);

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
    participants,
    loading,
    updating,
    updateMemory,
    removeImage,
    fetchMemory
  };
};
