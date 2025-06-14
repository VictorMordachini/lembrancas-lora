
import { MemoryCard } from '@/components/MemoryCard';

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
}

interface MemoriesGridProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
  onToggleFavorite: (memoryId: string, currentFavoriteState: boolean) => void;
}

export const MemoriesGrid = ({ memories, onMemoryClick, onToggleFavorite }: MemoriesGridProps) => {
  return (
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
            onClick={() => onMemoryClick(memory)}
            onToggleFavorite={onToggleFavorite}
            showPublicBadge={true}
          />
        ))}
      </div>
    </div>
  );
};
