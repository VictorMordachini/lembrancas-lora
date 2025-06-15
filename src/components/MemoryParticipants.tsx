
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PeopleTag {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface MemoryParticipantsProps {
  memoryId: string;
  className?: string;
  showLabel?: boolean;
}

export const MemoryParticipants = ({ memoryId, className = '', showLabel = true }: MemoryParticipantsProps) => {
  const [participants, setParticipants] = useState<PeopleTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('memory_participants')
          .select(`
            people_tags (
              id,
              name,
              avatar_url
            )
          `)
          .eq('memory_id', memoryId);

        if (error) throw error;

        const peopleTagsData = data
          ?.map(item => item.people_tags)
          .filter(Boolean) as PeopleTag[];

        setParticipants(peopleTagsData || []);
      } catch (error) {
        console.error('Erro ao carregar participantes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [memoryId]);

  if (loading || participants.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Users className="w-3 h-3" />
          <span>Com:</span>
        </div>
      )}
      {participants.slice(0, 3).map((participant) => (
        <Badge key={participant.id} variant="outline" className="flex items-center gap-1 text-xs">
          {participant.avatar_url ? (
            <Avatar className="w-4 h-4">
              <AvatarImage src={participant.avatar_url} alt={participant.name} />
              <AvatarFallback className="text-xs">
                {participant.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-600">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span>{participant.name}</span>
        </Badge>
      ))}
      {participants.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{participants.length - 3} mais
        </Badge>
      )}
    </div>
  );
};
