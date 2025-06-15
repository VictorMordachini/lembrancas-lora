
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMemories } from '@/hooks/useMemories';
import { MemoriesHeader } from '@/components/memories/MemoriesHeader';
import { MemoriesGrid } from '@/components/memories/MemoriesGrid';
import { EmptyMemoriesState } from '@/components/memories/EmptyMemoriesState';
import { MemoriesSkeleton } from '@/components/MemoriesSkeleton';
import { MemoryForm } from '@/components/MemoryForm';
import { MemoryEditForm } from '@/components/MemoryEditForm';

const Memories = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { memories, loading, fetchMemories, toggleFavorite } = useMemories();
  const navigate = useNavigate();

  if (authLoading) {
    return <MemoriesSkeleton />;
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleCreateFirst = () => {
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingMemoryId(null);
    fetchMemories();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMemoryId(null);
  };

  const handleEdit = (memoryId: string) => {
    setEditingMemoryId(memoryId);
    setShowForm(false);
  };

  if (showForm) {
    return <MemoryForm onSave={handleSave} onCancel={handleCancel} />;
  }

  if (editingMemoryId) {
    return (
      <MemoryEditForm 
        memoryId={editingMemoryId}
        onSave={handleSave} 
        onCancel={handleCancel} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <MemoriesHeader 
          onCreateMemory={() => setShowForm(true)}
          memoriesCount={memories.length}
        />
        
        {loading ? (
          <MemoriesSkeleton />
        ) : memories.length === 0 ? (
          <EmptyMemoriesState onCreateFirst={handleCreateFirst} />
        ) : (
          <MemoriesGrid 
            memories={memories} 
            onToggleFavorite={toggleFavorite}
            onEdit={handleEdit}
            showEditButton={true}
          />
        )}
      </div>
    </div>
  );
};

export default Memories;
