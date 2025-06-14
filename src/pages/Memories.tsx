
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MemoryCard } from '@/components/MemoryCard';
import { MemoryForm } from '@/components/MemoryForm';
import { ProfileDialog } from '@/components/ProfileDialog';
import { MemoriesSkeleton } from '@/components/MemoriesSkeleton';
import { toast } from 'sonner';

interface Memory {
  id: string;
  title: string;
  description: string | null;
  memory_date: string;
  music_url: string | null;
  dump_image_url: string | null;
  created_at: string;
}

const Memories = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user?.id)
        .order('memory_date', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar memórias: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
  };

  const handleMemoryClick = (memory: Memory) => {
    // Implementar visualização detalhada da memória
    console.log('Ver memória:', memory);
  };

  const handleMemorySaved = () => {
    setShowForm(false);
    fetchMemories();
    toast.success('Memória criada com sucesso!');
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <MemoryForm
            onSave={handleMemorySaved}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Memórias</h1>
              <p className="text-sm text-slate-500 hidden sm:block">Suas lembranças especiais</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 px-4 sm:px-6"
              size="default"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nova Memória</span>
              <span className="sm:hidden">Nova</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowProfile(true)}
              className="hover:bg-slate-100 transition-colors"
            >
              <User className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-2 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleSignOut}
              className="sm:hidden hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <MemoriesSkeleton />
        ) : memories.length === 0 ? (
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
                Nenhuma memória ainda
              </h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Comece criando sua primeira memória especial e guarde seus momentos mais importantes para sempre.
              </p>
              <Button 
                onClick={() => setShowForm(true)} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 px-8 py-3 text-lg"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar primeira memória
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Suas Memórias
              </h2>
              <p className="text-slate-600">
                {memories.length} memória{memories.length !== 1 ? 's' : ''} guardada{memories.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {memories.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  onClick={() => handleMemoryClick(memory)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Profile Dialog */}
      <ProfileDialog 
        open={showProfile} 
        onOpenChange={setShowProfile} 
      />
    </div>
  );
};

export default Memories;
