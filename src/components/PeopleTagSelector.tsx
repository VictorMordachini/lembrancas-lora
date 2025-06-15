
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, X, User } from 'lucide-react';
import { usePeopleTags } from '@/hooks/usePeopleTags';
import { cn } from '@/lib/utils';

interface PeopleTagSelectorProps {
  selectedTagIds: string[];
  onSelectionChange: (tagIds: string[]) => void;
  className?: string;
}

export const PeopleTagSelector = ({ 
  selectedTagIds, 
  onSelectionChange, 
  className 
}: PeopleTagSelectorProps) => {
  const { tags, loading, createTag } = usePeopleTags();
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Ensure tags is always an array and selectedTagIds is always an array
  const safeTags = Array.isArray(tags) ? tags : [];
  const safeSelectedTagIds = Array.isArray(selectedTagIds) ? selectedTagIds : [];
  
  const selectedTags = safeTags.filter(tag => safeSelectedTagIds.includes(tag.id));
  const availableTags = safeTags.filter(tag => !safeSelectedTagIds.includes(tag.id));

  const handleTagSelect = (tagId: string) => {
    onSelectionChange([...safeSelectedTagIds, tagId]);
    setOpen(false);
  };

  const handleTagRemove = (tagId: string) => {
    onSelectionChange(safeSelectedTagIds.filter(id => id !== tagId));
  };

  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreating(true);
    const newTag = await createTag(newTagName, undefined);
    
    if (newTag) {
      onSelectionChange([...safeSelectedTagIds, newTag.id]);
      setNewTagName('');
      setOpen(false);
    }
    setIsCreating(false);
  };

  const getTagInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando tags...</div>;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium text-gray-700">
        Pessoas Marcadas
      </label>
      
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="flex items-center gap-2 pl-1 pr-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={tag.avatar_url || ''} alt={tag.name} />
                <AvatarFallback className="text-xs bg-slate-100 text-slate-600">
                  {getTagInitials(tag.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{tag.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleTagRemove(tag.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Adicionar pessoa
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar ou criar nova tag..." />
            <CommandEmpty>
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-500">Nenhuma tag encontrada.</p>
                <div className="space-y-2">
                  <Input
                    placeholder="Nome da nova tag"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateNewTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNewTag}
                    disabled={!newTagName.trim() || isCreating}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isCreating ? 'Criando...' : 'Criar nova tag'}
                  </Button>
                </div>
              </div>
            </CommandEmpty>
            {availableTags.length > 0 && (
              <CommandGroup>
                {availableTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => handleTagSelect(tag.id)}
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
                        safeSelectedTagIds.includes(tag.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
