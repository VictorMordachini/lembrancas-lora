
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MemoryForm } from '@/components/MemoryForm';
import { ProfileDialog } from '@/components/ProfileDialog';
import { MemoriesSkeleton } from '@/components/MemoriesSkeleton';
import { MemoryOfTheDay } from '@/components/MemoryOfTheDay';
import { MemoriesHeader } from '@/components/memories/MemoriesHeader';
import { EmptyMemoriesState } from '@/components/memories/EmptyMemoriesState';
import { MemoriesGrid } from '@/components/memories/MemoriesGrid';
import { useMemories } from '@/hooks/useMemories';
import { toast } from 'sonner';

const Memories = () => {
  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { signOut } = useAuth();
  const { memories, loading, fetchMemories, toggleFavorite } = useMemories();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
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
      <MemoriesHeader
        onNewMemory={() => setShowForm(true)}
        onShowProfile={() => setShowProfile(true)}
        onSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <MemoriesSkeleton />
        ) : (
          <>
            <MemoryOfTheDay />
            
            {memories.length === 0 ? (
              <EmptyMemoriesState onCreateFirst={() => setShowForm(true)} />
            ) : (
              <MemoriesGrid
                memories={memories}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </>
        )}
      </main>

      <ProfileDialog 
        open={showProfile} 
        onOpenChange={setShowProfile} 
      />
    </div>
  );
};

export default Memories;
