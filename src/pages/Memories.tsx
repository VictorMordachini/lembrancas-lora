
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MemoryCard } from '@/components/MemoryCard';
import { MemoryForm } from '@/components/MemoryForm';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-slate-600">Carregando...</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <MemoryForm
            onSave={() => {
              setShowForm(false);
              fetchMemories();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/6be612b2-2efe-4135-ab7b-60dcc88c8ad0.png" 
              alt="Memórias Logo" 
              className="h-8 w-8"
            />
            <h1 className="text-2xl font-bold text-slate-800">Minhas Memórias</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Memória
            </Button>
            <Button variant="outline" size="icon">
              <User className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-4">
        {memories.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-slate-400 mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
                <img 
                  src="/lovable-uploads/6be612b2-2efe-4135-ab7b-60dcc88c8ad0.png" 
                  alt="Memórias Logo" 
                  className="w-8 h-8 opacity-50"
                />
              </div>
              <h3 className="text-xl font-medium text-slate-600 mb-2">
                Nenhuma memória ainda
              </h3>
              <p className="text-slate-500 mb-6">
                Comece criando sua primeira memória especial
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Criar primeira memória
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onClick={() => handleMemoryClick(memory)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Memories;
