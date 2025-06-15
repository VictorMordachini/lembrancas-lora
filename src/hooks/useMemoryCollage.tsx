
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMemoryCollage = () => {
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

      if (!error && data?.collageUrl) {
        toast.success('Colagem atualizada com sucesso!');
        return data.collageUrl;
      }
    } catch (error) {
      console.error('Erro ao criar colagem:', error);
    }
    
    // Use first image if collage creation fails
    return imageUrls[0];
  };

  return {
    createCollage
  };
};
