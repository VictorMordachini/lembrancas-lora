
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X, Filter } from 'lucide-react';
import { usePeopleTags } from '@/hooks/usePeopleTags';
import { cn } from '@/lib/utils';

interface ParticipantFilterProps {
  selectedParticipantId: string | null;
  onParticipantSelect: (participantId: string) => void;
  onClearFilter: () => void;
  className?: string;
}

export const ParticipantFilter = ({ 
  selectedParticipantId, 
  onParticipantSelect, 
  onClearFilter,
  className 
}: ParticipantFilterProps) => {
  const { tags, loading } = usePeopleTags();
  const [open, setOpen] = useState(false);

  // Ensure tags is always an array and not undefined
  const safeTags = Array.isArray(tags) ? tags : [];
  const selectedTag = safeTags.find(tag => tag.id === selectedParticipantId);

  const getTagInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando filtros...</div>;
  }

  // Don't render if no tags available
  if (safeTags.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {selectedTag && (
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
          <Avatar className="h-6 w-6">
            <AvatarImage src={selectedTag.avatar_url || ''} alt={selectedTag.name} />
            <AvatarFallback className="text-xs bg-slate-100 text-slate-600">
              {getTagInitials(selectedTag.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-blue-700">
            Filtrando por: {selectedTag.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-blue-100"
            onClick={onClearFilter}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtrar por pessoa
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          {safeTags.length > 0 && (
            <Command>
              <CommandInput placeholder="Buscar pessoa..." />
              <CommandEmpty>Nenhuma pessoa encontrada.</CommandEmpty>
              <CommandGroup>
                {safeTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => {
                      onParticipantSelect(tag.id);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={tag.avatar_url || ''} alt={tag.name} />
                      <AvatarFallback className="text-xs bg-slate-100 text-slate-600">
                        {getTagInitials(tag.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span>{tag.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedParticipantId === tag.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
