
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
  } | null;
}

export const useSecureMemories = (includePublic = false) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMemories = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('memories')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('memory_date', { ascending: false });

      // If we're only fetching user's own memories (not including public)
      if (!includePublic) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching memories:', error);
        throw error;
      }
      
      const typedMemories = (data || []).map(memory => ({
        ...memory,
        profiles: memory.profiles && typeof memory.profiles === 'object' && !Array.isArray(memory.profiles)
          ? memory.profiles as { username: string; full_name: string | null; avatar_url: string | null; }
          : null
      }));
      
      setMemories(typedMemories);
    } catch (error: any) {
      console.error('Error in fetchMemories:', error);
      toast.error(`Erro ao carregar memórias: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (memoryId: string, currentFavoriteState: boolean) => {
    if (!user) {
      toast.error('Você precisa estar logado para favoritar memórias');
      return;
    }

    try {
      const { error } = await supabase
        .from('memories')
        .update({ is_favorite: !currentFavoriteState })
        .eq('id', memoryId)
        .eq('user_id', user.id); // Extra security check

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
      console.error('Error toggling favorite:', error);
      toast.error(`Erro ao atualizar favorito: ${error.message}`);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMemories();
    } else {
      setMemories([]);
      setLoading(false);
    }
  }, [user, includePublic]);

  return {
    memories,
    loading,
    fetchMemories,
    toggleFavorite
  };
};
