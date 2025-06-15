
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { MemoriesSkeleton } from '@/components/MemoriesSkeleton';
import { MemoryHeader } from '@/components/memory-detail/MemoryHeader';
import { MemoryContent } from '@/components/memory-detail/MemoryContent';

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

interface MemoryImage {
  id: string;
  image_url: string;
  memory_id: string;
}

const MemoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [memoryImages, setMemoryImages] = useState<MemoryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemoryDetail = async () => {
    if (!id) {
      setError('ID da memória não encontrado');
      setLoading(false);
      return;
    }

    try {
      // Fetch memory details
      const { data: memoryData, error: memoryError } = await supabase
        .from('memories')
        .select('*')
        .eq('id', id)
        .single();

      if (memoryError) {
        if (memoryError.code === 'PGRST116') {
          setError('Memória não encontrada ou você não tem permissão para visualizá-la');
        } else {
          throw memoryError;
        }
        return;
      }

      setMemory(memoryData);

      // Fetch memory images
      const { data: imagesData, error: imagesError } = await supabase
        .from('memory_images')
        .select('*')
        .eq('memory_id', id)
        .order('created_at', { ascending: true });

      if (imagesError) {
        console.error('Erro ao carregar imagens:', imagesError);
      } else {
        setMemoryImages(imagesData || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar memória:', error);
      setError(`Erro ao carregar memória: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!memory || !user || memory.user_id !== user.id) return;

    try {
      const { error } = await supabase
        .from('memories')
        .update({ is_favorite: !memory.is_favorite })
        .eq('id', memory.id);

      if (error) throw error;

      setMemory(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
      toast.success(
        !memory.is_favorite 
          ? 'Memória adicionada aos favoritos!' 
          : 'Memória removida dos favoritos!'
      );
    } catch (error: any) {
      toast.error(`Erro ao atualizar favorito: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchMemoryDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MemoriesSkeleton />
        </div>
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-700 mb-3">
            {error || 'Memória não encontrada'}
          </h3>
          <p className="text-slate-500 mb-8">
            A memória que você está procurando não existe ou você não tem permissão para visualizá-la.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user && memory.user_id === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden">
          <CardHeader>
            <MemoryHeader 
              memory={memory}
              isOwner={!!isOwner}
              onToggleFavorite={toggleFavorite}
            />
          </CardHeader>

          <CardContent>
            <MemoryContent 
              memory={memory}
              memoryImages={memoryImages}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MemoryDetail;
