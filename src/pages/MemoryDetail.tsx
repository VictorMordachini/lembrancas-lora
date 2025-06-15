
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Music, Star, Globe, Heart, User } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { MemoriesSkeleton } from '@/components/MemoriesSkeleton';

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

const MemoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [memoryImages, setMemoryImages] = useState<MemoryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemoryDetail = async () => {
    if (!id) {
      setError('ID da memória não encontrado');
      setLoading(false);
      return;
    }

    try {
      // Fetch memory details
      const { data: memoryData, error: memoryError } = await supabase
        .from('memories')
        .select('*')
        .eq('id', id)
        .single();

      if (memoryError) {
        if (memoryError.code === 'PGRST116') {
          setError('Memória não encontrada ou você não tem permissão para visualizá-la');
        } else {
          throw memoryError;
        }
        return;
      }

      setMemory(memoryData);

      // Fetch memory images
      const { data: imagesData, error: imagesError } = await supabase
        .from('memory_images')
        .select('*')
        .eq('memory_id', id)
        .order('created_at', { ascending: true });

      if (imagesError) {
        console.error('Erro ao carregar imagens:', imagesError);
      } else {
        setMemoryImages(imagesData || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar memória:', error);
      setError(`Erro ao carregar memória: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!memory || !user || memory.user_id !== user.id) return;

    try {
      const { error } = await supabase
        .from('memories')
        .update({ is_favorite: !memory.is_favorite })
        .eq('id', memory.id);

      if (error) throw error;

      setMemory(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
      toast.success(
        !memory.is_favorite 
          ? 'Memória adicionada aos favoritos!' 
          : 'Memória removida dos favoritos!'
      );
    } catch (error: any) {
      toast.error(`Erro ao atualizar favorito: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchMemoryDetail();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MemoriesSkeleton />
        </div>
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-700 mb-3">
            {error || 'Memória não encontrada'}
          </h3>
          <p className="text-slate-500 mb-8">
            A memória que você está procurando não existe ou você não tem permissão para visualizá-la.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user && memory.user_id === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          {isOwner && (
            <Button
              onClick={toggleFavorite}
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
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden">
          {/* Main image or collage */}
          {memory.dump_image_url && (
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={memory.dump_image_url} 
                alt={memory.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardHeader>
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
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Description */}
            {memory.description && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Descrição</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {memory.description}
                </p>
              </div>
            )}

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

            {/* Individual Images */}
            {memoryImages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Imagens ({memoryImages.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {memoryImages.map((image, index) => (
                    <div key={image.id} className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                      <img 
                        src={image.image_url} 
                        alt={`${memory.title} - Imagem ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                        onClick={() => window.open(image.image_url, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MemoryDetail;
