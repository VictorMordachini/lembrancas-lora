
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PeopleTag {
  id: string;
  name: string;
  avatar_url: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const usePeopleTags = () => {
  const [peopleTags, setPeopleTags] = useState<PeopleTag[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPeopleTags = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('people_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setPeopleTags(data || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar tags de pessoas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createPeopleTag = async (name: string, avatarUrl?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('people_tags')
        .insert({
          name: name.trim(),
          avatar_url: avatarUrl || null,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setPeopleTags(prev => [...prev, data]);
      toast.success('Tag de pessoa criada com sucesso!');
      return data;
    } catch (error: any) {
      toast.error(`Erro ao criar tag: ${error.message}`);
      return null;
    }
  };

  const updatePeopleTag = async (id: string, name: string, avatarUrl?: string) => {
    try {
      const { data, error } = await supabase
        .from('people_tags')
        .update({
          name: name.trim(),
          avatar_url: avatarUrl || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPeopleTags(prev => prev.map(tag => 
        tag.id === id ? data : tag
      ));
      toast.success('Tag atualizada com sucesso!');
      return data;
    } catch (error: any) {
      toast.error(`Erro ao atualizar tag: ${error.message}`);
      return null;
    }
  };

  const deletePeopleTag = async (id: string) => {
    try {
      const { error } = await supabase
        .from('people_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPeopleTags(prev => prev.filter(tag => tag.id !== id));
      toast.success('Tag removida com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao remover tag: ${error.message}`);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPeopleTags();
    }
  }, [user]);

  return {
    peopleTags,
    loading,
    createPeopleTag,
    updatePeopleTag,
    deletePeopleTag,
    fetchPeopleTags
  };
};
