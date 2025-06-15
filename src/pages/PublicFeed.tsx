
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, User, Heart, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MemoryCard } from '@/components/MemoryCard';
import { MemoriesSkeleton } from '@/components/MemoriesSkeleton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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
  };
}

const PublicFeed = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchPublicMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMemories(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar memórias públicas:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicMemories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/6be612b2-2efe-4135-ab7b-60dcc88c8ad0.png" 
              alt="Memórias Logo" 
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Feed Público</h1>
              <p className="text-sm text-slate-500 hidden sm:block">Descubra memórias especiais compartilhadas pela comunidade</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              // Usuário logado - mostrar navegação para suas seções
              <>
                <Button
                  onClick={() => navigate('/memories')}
                  variant="outline"
                  className="hover:bg-slate-100 transition-colors"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Minhas Memórias</span>
                  <span className="sm:hidden">Minhas</span>
                </Button>
                <Button
                  onClick={() => navigate('/favorites')}
                  variant="outline"
                  className="hover:bg-slate-100 transition-colors"
                >
                  <Heart className="w-4 h-4 text-red-500" />
                </Button>
              </>
            ) : (
              // Usuário não logado - mostrar botão de login
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Entrar / Criar Conta</span>
                <span className="sm:hidden">Entrar</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <MemoriesSkeleton />
        ) : (
          <>
            {memories.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <img 
                      src="/lovable-uploads/6be612b2-2efe-4135-ab7b-60dcc88c8ad0.png" 
                      alt="Memórias Logo" 
                      className="w-10 h-10 opacity-60"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                    Nenhuma memória pública ainda
                  </h3>
                  <p className="text-slate-500 mb-8 leading-relaxed">
                    {user 
                      ? "Seja o primeiro a compartilhar suas memórias com a comunidade!"
                      : "Seja o primeiro a compartilhar suas memórias especiais com a comunidade!"
                    }
                  </p>
                  {user ? (
                    <Button 
                      onClick={() => navigate('/memories')} 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 px-8 py-3 text-lg"
                      size="lg"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      Criar minha primeira memória
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate('/auth')} 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 px-8 py-3 text-lg"
                      size="lg"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Criar conta e compartilhar
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">
                    Feed de Memórias
                  </h2>
                  <p className="text-slate-600">
                    {memories.length} memória{memories.length !== 1 ? 's' : ''} compartilhada{memories.length !== 1 ? 's' : ''} pela comunidade
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {memories.map((memory) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      showPublicBadge={true}
                      showAuthor={true}
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

export default PublicFeed;
