
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MemoryCard } from '@/components/MemoryCard';
import { MemoriesSkeleton } from '@/components/MemoriesSkeleton';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Memory {
  id: string;
  title: string;
  description: string | null;
  memory_date: string;
  music_url: string | null;
  dump_image_url: string | null;
  created_at: string;
  is_favorite: boolean;
}

const Favorites = () => {
  const [favoriteMemories, setFavoriteMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchFavoriteMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_favorite', true)
        .order('memory_date', { ascending: false });

      if (error) throw error;
      setFavoriteMemories(data || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar memórias favoritas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFavoriteMemories();
    }
  }, [user]);

  const handleMemoryClick = (memory: Memory) => {
    console.log('Ver memória:', memory);
  };

  const handleToggleFavorite = async (memoryId: string, currentFavoriteState: boolean) => {
    try {
      const { error } = await supabase
        .from('memories')
        .update({ is_favorite: !currentFavoriteState })
        .eq('id', memoryId);

      if (error) throw error;

      // Remove from favorites list if unfavorited
      if (currentFavoriteState) {
        setFavoriteMemories(prev => prev.filter(memory => memory.id !== memoryId));
        toast.success('Memória removida dos favoritos!');
      }
    } catch (error: any) {
      toast.error(`Erro ao atualizar favorito: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Favoritas</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MemoriesSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Favoritas</h1>
              <p className="text-sm text-slate-500 hidden sm:block">Suas memórias especiais</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favoriteMemories.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                Nenhuma memória favorita
              </h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Marque suas memórias especiais como favoritas clicando na estrela para encontrá-las facilmente aqui.
              </p>
              <Button 
                onClick={() => navigate('/')} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 px-8 py-3 text-lg"
                size="lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar às memórias
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Memórias Favoritas
              </h2>
              <p className="text-slate-600">
                {favoriteMemories.length} memória{favoriteMemories.length !== 1 ? 's' : ''} favorita{favoriteMemories.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteMemories.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  onClick={() => handleMemoryClick(memory)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
