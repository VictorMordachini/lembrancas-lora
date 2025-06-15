
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeleteMemory = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const deleteMemory = async (memoryId: string) => {
    setLoading(true);
    
    try {
      // Call the database function to delete memory with cleanup
      const { error } = await supabase.rpc('delete_memory_with_cleanup', {
        memory_id_param: memoryId
      });

      if (error) throw error;

      toast.success('Memória excluída com sucesso!');
      navigate('/');
    } catch (error: any) {
      console.error('Erro ao excluir memória:', error);
      toast.error(`Erro ao excluir memória: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    deleteMemory
  };
};
