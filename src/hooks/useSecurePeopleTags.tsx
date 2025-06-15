
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PeopleTag {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useSecurePeopleTags = () => {
  const [peopleTags, setPeopleTags] = useState<PeopleTag[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPeopleTags = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('people_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching people tags:', error);
        throw error;
      }

      setPeopleTags(data || []);
    } catch (error: any) {
      console.error('Error in fetchPeopleTags:', error);
      toast.error(`Erro ao carregar tags de pessoas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createPeopleTag = async (name: string, avatarUrl?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar tags');
      return null;
    }

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
      toast.success('Tag criada com sucesso!');
      return data;
    } catch (error: any) {
      console.error('Error creating people tag:', error);
      toast.error(`Erro ao criar tag: ${error.message}`);
      return null;
    }
  };

  const updatePeopleTag = async (id: string, updates: Partial<Pick<PeopleTag, 'name' | 'avatar_url'>>) => {
    if (!user) {
      toast.error('Você precisa estar logado para atualizar tags');
      return false;
    }

    try {
      const { error } = await supabase
        .from('people_tags')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id); // Extra security check

      if (error) throw error;

      setPeopleTags(prev => prev.map(tag => 
        tag.id === id ? { ...tag, ...updates } : tag
      ));
      toast.success('Tag atualizada com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error updating people tag:', error);
      toast.error(`Erro ao atualizar tag: ${error.message}`);
      return false;
    }
  };

  const deletePeopleTag = async (id: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para deletar tags');
      return false;
    }

    try {
      const { error } = await supabase
        .from('people_tags')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Extra security check

      if (error) throw error;

      setPeopleTags(prev => prev.filter(tag => tag.id !== id));
      toast.success('Tag deletada com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error deleting people tag:', error);
      toast.error(`Erro ao deletar tag: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPeopleTags();
    } else {
      setPeopleTags([]);
      setLoading(false);
    }
  }, [user]);

  return {
    peopleTags,
    loading,
    fetchPeopleTags,
    createPeopleTag,
    updatePeopleTag,
    deletePeopleTag
  };
};
