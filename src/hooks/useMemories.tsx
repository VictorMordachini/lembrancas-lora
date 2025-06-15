
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
  user_id: string;
  profiles?: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useMemories = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user?.id)
        .order('memory_date', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar memórias: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (memoryId: string, currentFavoriteState: boolean) => {
    try {
      const { error } = await supabase
        .from('memories')
        .update({ is_favorite: !currentFavoriteState })
        .eq('id', memoryId);

      if (error) throw error;

      setMemories(prev => prev.map(memory => 
        memory.id === memoryId 
          ? { ...memory, is_favorite: !currentFavoriteState }
          : memory
      ));

      toast.success(
        !currentFavoriteState 
          ? 'Memória adicionada aos favoritos!' 
          : 'Memória removida dos favoritos!'
      );
    } catch (error: any) {
      toast.error(`Erro ao atualizar favorito: ${error.message}`);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user]);

  return {
    memories,
    loading,
    fetchMemories,
    toggleFavorite
  };
};
