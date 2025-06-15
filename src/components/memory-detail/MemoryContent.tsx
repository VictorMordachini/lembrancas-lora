
import { Music } from 'lucide-react';
import { ImageGallery } from './ImageGallery';

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

interface MemoryImage {
  id: string;
  image_url: string;
  memory_id: string;
}

interface MemoryContentProps {
  memory: Memory;
  memoryImages: MemoryImage[];
}

export const MemoryContent = ({ memory, memoryImages }: MemoryContentProps) => {
  return (
    <div className="space-y-6">
      {/* Description */}
      {memory.description && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Descrição</h3>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
            {memory.description}
          </p>
        </div>
      )}

      {/* Images Gallery */}
      <ImageGallery
        memoryTitle={memory.title}
        dumpImageUrl={memory.dump_image_url}
        memoryImages={memoryImages}
      />

      {/* Music */}
      {memory.music_url && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Music className="w-5 h-5 text-blue-500" />
            Música da Memória
          </h3>
          <div className="bg-slate-50 rounded-lg p-4">
            <a 
              href={memory.music_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {memory.music_url}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
