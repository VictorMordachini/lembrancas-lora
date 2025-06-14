
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Music, Image, Clock } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
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
  const formatMemoryDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Data inválida';
      
      return format(date, "d 'de' MMMM, yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatCreatedDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return '';
      
      return format(date, "d/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return '';
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-white border-slate-200 hover:border-slate-300 overflow-hidden"
      onClick={onClick}
    >
      {memory.dump_image_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={memory.dump_image_url} 
            alt={memory.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {memory.title}
            </h3>
            {memory.description && (
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                {memory.description}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="font-medium">
                {formatMemoryDate(memory.memory_date)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Clock className="w-3 h-3" />
              <span>
                Criada em {formatCreatedDate(memory.created_at)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {memory.music_url && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                <Music className="w-3 h-3 mr-1" />
                Música
              </Badge>
            )}
            {memory.dump_image_url && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
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
