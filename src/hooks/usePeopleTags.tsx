
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
  is_shared: boolean;
}

export const usePeopleTags = () => {
  const [tags, setTags] = useState<PeopleTag[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTags = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('people_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar tags de pessoas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (name: string, avatarUrl?: string, isShared: boolean = false) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('people_tags')
        .insert({
          name: name.trim(),
          avatar_url: avatarUrl || null,
          user_id: user.id,
          is_shared: isShared
        })
        .select()
        .single();

      if (error) throw error;

      setTags(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Tag "${name}" criada com sucesso!`);
      return data;
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error(`Você já tem uma tag com o nome "${name}"`);
      } else {
        toast.error(`Erro ao criar tag: ${error.message}`);
      }
      return null;
    }
  };

  const updateTag = async (tagId: string, name: string, avatarUrl?: string, isShared?: boolean) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('people_tags')
        .update({
          name: name.trim(),
          avatar_url: avatarUrl || null,
          is_shared: isShared
        })
        .eq('id', tagId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setTags(prev => prev.map(tag => 
        tag.id === tagId ? data : tag
      ).sort((a, b) => a.name.localeCompare(b.name)));

      toast.success(`Tag atualizada com sucesso!`);
      return true;
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error(`Você já tem uma tag com o nome "${name}"`);
      } else {
        toast.error(`Erro ao atualizar tag: ${error.message}`);
      }
      return false;
    }
  };

  const deleteTag = async (tagId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('people_tags')
        .delete()
        .eq('id', tagId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTags(prev => prev.filter(tag => tag.id !== tagId));
      toast.success('Tag removida com sucesso!');
      return true;
    } catch (error: any) {
      toast.error(`Erro ao remover tag: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTags();
    }
  }, [user]);

  return {
    tags,
    loading,
    createTag,
    updateTag,
    deleteTag,
    refetchTags: fetchTags
  };
};
