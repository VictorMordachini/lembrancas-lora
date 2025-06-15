
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Share } from 'lucide-react';

interface PeopleTag {
  id: string;
  name: string;
  avatar_url: string | null;
  is_shared?: boolean;
}

interface MemoryParticipant {
  id: string;
  people_tags: PeopleTag;
}

interface PeopleBadgesProps {
  participants: MemoryParticipant[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  clickable?: boolean;
}

export const PeopleBadges = ({ 
  participants, 
  maxDisplay = 3, 
  size = 'md',
  className = '',
  clickable = true
}: PeopleBadgesProps) => {
  const navigate = useNavigate();

  if (!participants || participants.length === 0) {
    return null;
  }

  const displayParticipants = participants.slice(0, maxDisplay);
  const remainingCount = participants.length - maxDisplay;

  const getTagInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  const handleParticipantClick = (participantId: string) => {
    if (clickable) {
      navigate(`/participant/${participantId}`);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <User className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-500">Com:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayParticipants.map((participant) => (
          <Badge
            key={participant.id}
            variant="secondary"
            className={`flex items-center gap-2 pl-1 ${
              clickable ? 'cursor-pointer hover:bg-gray-200 transition-colors' : ''
            }`}
            onClick={() => handleParticipantClick(participant.people_tags.id)}
          >
            <Avatar className={sizeClasses[size]}>
              <AvatarImage 
                src={participant.people_tags.avatar_url || ''} 
                alt={participant.people_tags.name} 
              />
              <AvatarFallback className="bg-slate-100 text-slate-600">
                {getTagInitials(participant.people_tags.name)}
              </AvatarFallback>
            </Avatar>
            <span>{participant.people_tags.name}</span>
            {participant.people_tags.is_shared && (
              <Share className="w-3 h-3 text-blue-600" />
            )}
          </Badge>
        ))}
        
        {remainingCount > 0 && (
          <Badge variant="outline">
            +{remainingCount} mais
          </Badge>
        )}
      </div>
    </div>
  );
};
