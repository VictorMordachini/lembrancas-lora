
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, X, Users } from 'lucide-react';
import { usePeopleTags } from '@/hooks/usePeopleTags';

interface PeopleTag {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface PeopleTagSelectorProps {
  selectedTags: PeopleTag[];
  onTagsChange: (tags: PeopleTag[]) => void;
  disabled?: boolean;
}

export const PeopleTagSelector = ({ selectedTags, onTagsChange, disabled = false }: PeopleTagSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const { peopleTags, createPeopleTag, loading } = usePeopleTags();

  const handleSelectTag = (tag: PeopleTag) => {
    if (!selectedTags.find(selected => selected.id === tag.id)) {
      onTagsChange([...selectedTags, tag]);
    }
    setOpen(false);
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
  };

  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return;
    
    const newTag = await createPeopleTag(newTagName);
    if (newTag) {
      onTagsChange([...selectedTags, newTag]);
      setNewTagName('');
      setOpen(false);
    }
  };

  const availableTags = Array.isArray(peopleTags) 
    ? peopleTags.filter(tag => !selectedTags.find(selected => selected.id === tag.id))
    : [];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        Pessoas Marcadas
      </label>
      
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="flex items-center gap-2 pr-1">
              {tag.avatar_url ? (
                <Avatar className="w-5 h-5">
                  <AvatarImage src={tag.avatar_url} alt={tag.name} />
                  <AvatarFallback className="text-xs">
                    {tag.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    {tag.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span>{tag.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-gray-200"
                onClick={() => handleRemoveTag(tag.id)}
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Tag Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            disabled={disabled || loading}
            className="w-full justify-start"
          >
            <Users className="w-4 h-4 mr-2" />
            Adicionar pessoa
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput 
              placeholder="Buscar ou criar nova pessoa..." 
              value={newTagName}
              onValueChange={setNewTagName}
            />
            <CommandList>
              {availableTags.length > 0 && (
                <CommandGroup heading="Pessoas existentes">
                  {availableTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleSelectTag(tag)}
                      className="flex items-center gap-2"
                    >
                      {tag.avatar_url ? (
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={tag.avatar_url} alt={tag.name} />
                          <AvatarFallback className="text-xs">
                            {tag.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-600">
                            {tag.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span>{tag.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {newTagName.trim() && !availableTags.find(tag => 
                tag.name.toLowerCase() === newTagName.toLowerCase()
              ) && (
                <CommandGroup heading="Criar nova pessoa">
                  <CommandItem onSelect={handleCreateNewTag} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Criar "{newTagName}"</span>
                  </CommandItem>
                </CommandGroup>
              )}
              
              {availableTags.length === 0 && !newTagName.trim() && (
                <CommandEmpty>
                  Digite o nome de uma pessoa para criar uma nova tag.
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
