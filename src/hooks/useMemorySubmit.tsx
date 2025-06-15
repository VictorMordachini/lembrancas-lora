
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PeopleTag {
  id: string;
  name: string;
  avatar_url: string | null;
}

export const useMemorySubmit = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const uploadImages = async (memoryId: string, images: File[]) => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
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

  const createCollage = async (imageUrls: string[], memoryId: string, title: string) => {
    if (imageUrls.length === 0) return null;

    try {
      const { data, error } = await supabase.functions.invoke('create-memory-collage', {
        body: { 
          imageUrls, 
          memoryId, 
          title 
        }
      });

      if (error) throw error;
      return data.collageUrl;
    } catch (error) {
      console.error('Erro ao criar colagem:', error);
      return null;
    }
  };

  const addMemoryParticipants = async (memoryId: string, peopleTags: PeopleTag[]) => {
    if (peopleTags.length === 0) return;

    try {
      const participants = peopleTags.map(tag => ({
        memory_id: memoryId,
        people_tag_id: tag.id
      }));

      const { error } = await supabase
        .from('memory_participants')
        .insert(participants);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao adicionar participantes:', error);
      toast.error('Erro ao adicionar pessoas marcadas');
    }
  };

  const submitMemory = async (
    title: string,
    description: string,
    memoryDate: string,
    musicUrl: string,
    images: File[],
    isPublic: boolean,
    peopleTags: PeopleTag[] = []
  ) => {
    if (!title.trim() || !memoryDate) {
      toast.error('Por favor, preencha pelo menos o título e a data da memória.');
      return false;
    }

    if (!user) {
      toast.error('Você precisa estar logado para criar uma memória.');
      return false;
    }

    setLoading(true);

    try {
      // 1. Criar a memória primeiro
      const { data: memory, error: memoryError } = await supabase
        .from('memories')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          memory_date: memoryDate,
          music_url: musicUrl.trim() || null,
          user_id: user.id,
          is_public: isPublic
        })
        .select()
        .single();

      if (memoryError) throw memoryError;

      let finalDumpImageUrl = null;

      // 2. Se há imagens, fazer upload e criar colagem
      if (images.length > 0) {
        toast.info('Fazendo upload das imagens...');
        const uploadedUrls = await uploadImages(memory.id, images);
        
        if (uploadedUrls.length > 0) {
          // Salvar URLs individuais na tabela memory_images
          for (const url of uploadedUrls) {
            await supabase
              .from('memory_images')
              .insert({
                memory_id: memory.id,
                image_url: url
              });
          }

          // Criar colagem
          toast.info('Gerando colagem automática...');
          finalDumpImageUrl = await createCollage(uploadedUrls, memory.id, title);
          
          if (finalDumpImageUrl) {
            toast.success('Colagem criada com sucesso!');
          } else {
            toast.warning('Não foi possível criar a colagem, mas as imagens foram salvas.');
            // Se não conseguir criar colagem, usar a primeira imagem
            finalDumpImageUrl = uploadedUrls[0];
          }
        }
      }

      // 3. Atualizar a memória com a URL da colagem/imagem
      if (finalDumpImageUrl) {
        await supabase
          .from('memories')
          .update({ dump_image_url: finalDumpImageUrl })
          .eq('id', memory.id);
      }

      // 4. Adicionar pessoas marcadas
      if (peopleTags.length > 0) {
        await addMemoryParticipants(memory.id, peopleTags);
      }

      return true;
    } catch (error: any) {
      console.error('Erro ao salvar memória:', error);
      toast.error(`Erro ao salvar memória: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitMemory
  };
};
