
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Heart, Star, Calendar, Trash2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeleteMemoryDialog } from './DeleteMemoryDialog';
import { useDeleteMemory } from '@/hooks/useDeleteMemory';

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

interface MemoryHeaderProps {
  memory: Memory;
  isOwner: boolean;
  onToggleFavorite: () => void;
}

export const MemoryHeader = ({ memory, isOwner, onToggleFavorite }: MemoryHeaderProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { loading: deleteLoading, deleteMemory } = useDeleteMemory();

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

  const handleDeleteConfirm = () => {
    deleteMemory(memory.id);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold text-slate-800">
              {memory.title}
            </h1>
            <div className="flex gap-2">
              {memory.is_public && (
                <Badge className="bg-green-100 text-green-700">
                  <Globe className="w-3 h-3 mr-1" />
                  Público
                </Badge>
              )}
              {memory.is_favorite && isOwner && (
                <Badge className="bg-yellow-100 text-yellow-700">
                  <Heart className="w-3 h-3 mr-1" />
                  Favorito
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="font-medium">
                {formatMemoryDate(memory.memory_date)}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-slate-500">
            Criada em {formatCreatedDate(memory.created_at)}
          </p>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              onClick={onToggleFavorite}
              variant="ghost"
              size="icon"
              className="hover:bg-slate-100"
            >
              <Star 
                className={`w-5 h-5 ${
                  memory.is_favorite 
                    ? 'text-yellow-500 fill-yellow-500' 
                    : 'text-slate-400'
                }`}
              />
            </Button>
            
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="ghost"
              size="icon"
              className="hover:bg-red-50 hover:text-red-600 text-slate-400"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      <DeleteMemoryDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        memoryTitle={memory.title}
      />
    </>
  );
};
