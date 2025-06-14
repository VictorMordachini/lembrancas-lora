
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Music, Image } from 'lucide-react';
import { formatDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Memory {
  id: string;
  title: string;
  description: string | null;
  memory_date: string;
  music_url: string | null;
  dump_image_url: string | null;
  created_at: string;
}

interface MemoryCardProps {
  memory: Memory;
  onClick: () => void;
}

export const MemoryCard = ({ memory, onClick }: MemoryCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white border-slate-200"
      onClick={onClick}
    >
      {memory.dump_image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={memory.dump_image_url} 
            alt={memory.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-slate-800 text-lg mb-1">{memory.title}</h3>
            {memory.description && (
              <p className="text-slate-600 text-sm line-clamp-2">{memory.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(new Date(memory.memory_date), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
          
          <div className="flex gap-2">
            {memory.music_url && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                <Music className="w-3 h-3 mr-1" />
                Música
              </Badge>
            )}
            {memory.dump_image_url && (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                <Image className="w-3 h-3 mr-1" />
                Imagens
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
