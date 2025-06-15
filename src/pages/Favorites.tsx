
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
  is_public: boolean;
  user_id: string;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_favorite', true)
        .order('memory_date', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar favoritos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const handleMemoryClick = (memory: Memory) => {
    console.log('Ver memória favorita:', memory);
  };

  const handleToggleFavorite = async (memoryId: string, currentFavoriteState: boolean) => {
    try {
      const { error } = await supabase
        .from('memories')
        .update({ is_favorite: !currentFavoriteState })
        .eq('id', memoryId);

      if (error) throw error;

      // Update local state
      setFavorites(prev => prev.filter(memory => memory.id !== memoryId));

      toast.success('Memória removida dos favoritos!');
    } catch (error: any) {
      toast.error(`Erro ao atualizar favorito: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="icon"
              className="hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Favoritos</h1>
                <p className="text-sm text-slate-500 hidden sm:block">Suas memórias favoritas</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <MemoriesSkeleton />
        ) : (
          <>
            {favorites.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                    <Heart className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                    Nenhum favorito ainda
                  </h3>
                  <p className="text-slate-500 mb-8 leading-relaxed">
                    Marque suas memórias especiais como favoritas para encontrá-las facilmente aqui.
                  </p>
                  <Button 
                    onClick={() => navigate('/')} 
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 px-8 py-3 text-lg"
                    size="lg"
                  >
                    Ver minhas memórias
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">
                    Suas Memórias Favoritas
                  </h2>
                  <p className="text-slate-600">
                    {favorites.length} memória{favorites.length !== 1 ? 's' : ''} favorita{favorites.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favorites.map((memory) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      onClick={() => handleMemoryClick(memory)}
                      onToggleFavorite={handleToggleFavorite}
                      showPublicBadge={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Favorites;
