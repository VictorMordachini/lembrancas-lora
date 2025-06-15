
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Music, Image, Clock, Star, Globe, Edit, User } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { MemoryParticipants } from '@/components/MemoryParticipants';

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
  profiles?: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface MemoryCardProps {
  memory: Memory;
  onClick?: () => void;
  onToggleFavorite?: (memoryId: string, currentFavoriteState: boolean) => void;
  onEdit?: (memoryId: string) => void;
  showPublicBadge?: boolean;
  showEditButton?: boolean;
  showAuthor?: boolean;
}

export const MemoryCard = ({ 
  memory, 
  onClick, 
  onToggleFavorite, 
  onEdit,
  showPublicBadge = false,
  showEditButton = false,
  showAuthor = false
}: MemoryCardProps) => {
  const navigate = useNavigate();

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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(memory.id, memory.is_favorite);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(memory.id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: navigate to memory detail page
      navigate(`/memory/${memory.id}`);
    }
  };

  const getAuthorDisplayName = () => {
    if (!memory.profiles) return 'Usuário';
    return memory.profiles.full_name || memory.profiles.username || 'Usuário';
  };

  const getAuthorInitials = () => {
    const name = getAuthorDisplayName();
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-white border-slate-200 hover:border-slate-300 overflow-hidden relative"
      onClick={handleCardClick}
    >
      {/* Badges container */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        {showPublicBadge && memory.is_public && (
          <div className="p-2 rounded-full bg-green-100 backdrop-blur-sm shadow-lg">
            <Globe className="w-4 h-4 text-green-600" />
          </div>
        )}
        
        {/* Edit Button */}
        {showEditButton && onEdit && (
          <button
            onClick={handleEditClick}
            className="p-2 rounded-full bg-blue-100 backdrop-blur-sm shadow-lg hover:bg-blue-200 transition-all duration-200 hover:scale-110"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
        )}
        
        {/* Favorite Star */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
          >
            <Star 
              className={`w-4 h-4 transition-colors ${
                memory.is_favorite 
                  ? 'text-yellow-500 fill-yellow-500' 
                  : 'text-slate-400 hover:text-yellow-500'
              }`}
            />
          </button>
        )}
      </div>

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
          {/* Author info - shown at the top when enabled */}
          {showAuthor && memory.profiles && (
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={memory.profiles.avatar_url || ''} 
                  alt={getAuthorDisplayName()}
                />
                <AvatarFallback className="text-xs bg-slate-100 text-slate-600">
                  {getAuthorInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {getAuthorDisplayName()}
                </p>
                <p className="text-xs text-slate-500">
                  @{memory.profiles.username}
                </p>
              </div>
            </div>
          )}

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

            {/* Memory Participants */}
            <MemoryParticipants memoryId={memory.id} className="pt-1" />
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
