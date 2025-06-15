
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Share, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MemoriesGrid } from '@/components/memories/MemoriesGrid';
import { MemoriesSkeleton } from '@/components/MemoriesSkeleton';
import { toast } from 'sonner';

interface ParticipantStats {
  people_tag_id: string;
  name: string;
  avatar_url: string | null;
  tag_owner_id: string;
  is_shared: boolean;
  total_memories: number;
  public_memories: number;
}

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

const ParticipantProfile = () => {
  const { participantId } = useParams<{ participantId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [participantStats, setParticipantStats] = useState<ParticipantStats | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipantData = async () => {
    if (!participantId || !user) return;

    try {
      // Fetch participant stats
      const { data: statsData, error: statsError } = await supabase
        .from('participant_memory_stats')
        .select('*')
        .eq('people_tag_id', participantId)
        .single();

      if (statsError) throw statsError;
      setParticipantStats(statsData);

      // Fetch memories where this participant is tagged
      const { data: memoriesData, error: memoriesError } = await supabase
        .from('memories')
        .select(`
          *,
          memory_participants!inner (
            people_tag_id
          )
        `)
        .eq('memory_participants.people_tag_id', participantId)
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order('memory_date', { ascending: false });

      if (memoriesError) throw memoriesError;
      setMemories(memoriesData || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar perfil do participante: ${error.message}`);
      navigate('/memories');
    } finally {
      setLoading(false);
    }
  };

  const getTagInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    fetchParticipantData();
  }, [participantId, user]);

  if (loading) {
    return <MemoriesSkeleton />;
  }

  if (!participantStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Participante não encontrado
            </h1>
            <Button onClick={() => navigate('/memories')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar às Memórias
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/memories')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>

        {/* Participant Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={participantStats.avatar_url || ''} 
                  alt={participantStats.name} 
                />
                <AvatarFallback className="text-2xl bg-slate-100 text-slate-600">
                  {getTagInitials(participantStats.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {participantStats.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{participantStats.total_memories} memórias</span>
                  </div>
                  {participantStats.public_memories > 0 && (
                    <div className="flex items-center gap-1">
                      <Share className="w-4 h-4" />
                      <span>{participantStats.public_memories} públicas</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  {participantStats.is_shared && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      <Share className="w-3 h-3 mr-1" />
                      Tag Compartilhada
                    </Badge>
                  )}
                  {participantStats.tag_owner_id === user?.id ? (
                    <Badge variant="outline">Sua tag</Badge>
                  ) : (
                    <Badge variant="outline">Tag de outro usuário</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Memories Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Memórias com {participantStats.name}
          </h2>
          
          {memories.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhuma memória encontrada
                </h3>
                <p className="text-gray-500">
                  {participantStats.name} ainda não foi marcado(a) em nenhuma memória visível para você.
                </p>
              </CardContent>
            </Card>
          ) : (
            <MemoriesGrid 
              memories={memories}
              showAuthor={true}
              showPublicBadge={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantProfile;
