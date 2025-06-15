
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
}

export const useMemoryFilter = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMemoriesByParticipant = async (participantId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          memory_participants!inner (
            people_tag_id
          )
        `)
        .eq('memory_participants.people_tag_id', participantId)
        .eq('user_id', user.id)
        .order('memory_date', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error: any) {
      toast.error(`Erro ao filtrar memórias: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setSelectedParticipantId(null);
    setMemories([]);
  };

  const filterByParticipant = (participantId: string) => {
    setSelectedParticipantId(participantId);
    fetchMemoriesByParticipant(participantId);
  };

  return {
    memories,
    loading,
    selectedParticipantId,
    filterByParticipant,
    clearFilter
  };
};
