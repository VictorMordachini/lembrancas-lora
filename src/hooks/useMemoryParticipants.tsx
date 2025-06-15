
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MemoryParticipant {
  id: string;
  memory_id: string;
  people_tag_id: string;
  created_at: string;
  people_tags: {
    id: string;
    name: string;
    avatar_url: string | null;
    user_id: string;
  };
}

export const useMemoryParticipants = (memoryId?: string) => {
  const [participants, setParticipants] = useState<MemoryParticipant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchParticipants = async () => {
    if (!memoryId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('memory_participants')
        .select(`
          *,
          people_tags (
            id,
            name,
            avatar_url,
            user_id
          )
        `)
        .eq('memory_id', memoryId);

      if (error) throw error;
      setParticipants(data || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar participantes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = async (peopleTagId: string) => {
    if (!memoryId) return false;

    try {
      const { data, error } = await supabase
        .from('memory_participants')
        .insert({
          memory_id: memoryId,
          people_tag_id: peopleTagId
        })
        .select(`
          *,
          people_tags (
            id,
            name,
            avatar_url,
            user_id
          )
        `)
        .single();

      if (error) throw error;

      setParticipants(prev => [...prev, data]);
      return true;
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Esta pessoa já está marcada nesta memória');
      } else {
        toast.error(`Erro ao adicionar participante: ${error.message}`);
      }
      return false;
    }
  };

  const removeParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('memory_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      setParticipants(prev => prev.filter(p => p.id !== participantId));
      return true;
    } catch (error: any) {
      toast.error(`Erro ao remover participante: ${error.message}`);
      return false;
    }
  };

  const setMemoryParticipants = async (peopleTagIds: string[]) => {
    if (!memoryId) return false;

    try {
      // First, remove all existing participants
      await supabase
        .from('memory_participants')
        .delete()
        .eq('memory_id', memoryId);

      // Then add the new participants
      if (peopleTagIds.length > 0) {
        const { error } = await supabase
          .from('memory_participants')
          .insert(
            peopleTagIds.map(tagId => ({
              memory_id: memoryId,
              people_tag_id: tagId
            }))
          );

        if (error) throw error;
      }

      // Refresh participants
      await fetchParticipants();
      return true;
    } catch (error: any) {
      toast.error(`Erro ao atualizar participantes: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    if (memoryId) {
      fetchParticipants();
    }
  }, [memoryId]);

  return {
    participants,
    loading,
    addParticipant,
    removeParticipant,
    setMemoryParticipants,
    refetchParticipants: fetchParticipants
  };
};
