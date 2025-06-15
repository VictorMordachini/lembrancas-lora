
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMemories } from '@/hooks/useMemories';
import { useMemoryFilter } from '@/hooks/useMemoryFilter';
import { MemoriesHeader } from '@/components/memories/MemoriesHeader';
import { MemoriesGrid } from '@/components/memories/MemoriesGrid';
import { EmptyMemoriesState } from '@/components/memories/EmptyMemoriesState';
import { MemoriesSkeleton } from '@/components/MemoriesSkeleton';
import { MemoryForm } from '@/components/MemoryForm';
import { MemoryEditForm } from '@/components/MemoryEditForm';
import { ParticipantFilter } from '@/components/ParticipantFilter';

const Memories = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { memories, loading, fetchMemories, toggleFavorite } = useMemories();
  const { 
    memories: filteredMemories, 
    loading: filterLoading, 
    selectedParticipantId, 
    filterByParticipant, 
    clearFilter 
  } = useMemoryFilter();
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
    if (selectedParticipantId) {
      filterByParticipant(selectedParticipantId);
    }
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

  // Determine which memories to display
  const displayMemories = selectedParticipantId ? filteredMemories : memories;
  const isLoading = selectedParticipantId ? filterLoading : loading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <MemoriesHeader 
          onCreateMemory={() => setShowForm(true)}
          memoriesCount={selectedParticipantId ? filteredMemories.length : memories.length}
        />
        
        {/* Participant Filter */}
        <div className="mb-6">
          <ParticipantFilter
            selectedParticipantId={selectedParticipantId}
            onParticipantSelect={filterByParticipant}
            onClearFilter={clearFilter}
          />
        </div>
        
        {isLoading ? (
          <MemoriesSkeleton />
        ) : displayMemories.length === 0 ? (
          selectedParticipantId ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhuma memória encontrada
              </h3>
              <p className="text-gray-500">
                Não há memórias com a pessoa selecionada.
              </p>
            </div>
          ) : (
            <EmptyMemoriesState onCreateFirst={handleCreateFirst} />
          )
        ) : (
          <MemoriesGrid 
            memories={displayMemories} 
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
