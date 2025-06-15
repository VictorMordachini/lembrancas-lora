
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
  onToggleFavorite?: (memoryId: string, currentFavoriteState: boolean) => void;
  onEdit?: (memoryId: string) => void;
  showPublicBadge?: boolean;
  showEditButton?: boolean;
}

export const MemoriesGrid = ({ 
  memories, 
  onToggleFavorite, 
  onEdit,
  showPublicBadge = false,
  showEditButton = false 
}: MemoriesGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {memories.map((memory) => (
        <MemoryCard
          key={memory.id}
          memory={memory}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          showPublicBadge={showPublicBadge}
          showEditButton={showEditButton}
        />
      ))}
    </div>
  );
};
