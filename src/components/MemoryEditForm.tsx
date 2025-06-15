import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload, X, Trash2 } from 'lucide-react';
import { MemoryFormHeader } from '@/components/memory-form/MemoryFormHeader';
import { BasicFields } from '@/components/memory-form/BasicFields';
import { PrivacyControl } from '@/components/memory-form/PrivacyControl';
import { MusicField } from '@/components/memory-form/MusicField';
import { PeopleTagSelector } from '@/components/PeopleTagSelector';
import { useMemoryEdit } from '@/hooks/useMemoryEdit';

interface PeopleTag {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface MemoryEditFormProps {
  memoryId: string;
  onSave: () => void;
  onCancel: () => void;
}

export const MemoryEditForm = ({ memoryId, onSave, onCancel }: MemoryEditFormProps) => {
  const { memory, memoryImages, participants, loading, updating, updateMemory, removeImage } = useMemoryEdit(memoryId);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<PeopleTag[]>([]);

  // Populate form when memory loads
  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setDescription(memory.description || '');
      setMemoryDate(memory.memory_date);
      setMusicUrl(memory.music_url || '');
      setIsPublic(memory.is_public);
      setIsFavorite(memory.is_favorite);
    }
  }, [memory]);

  // Update participants when they are loaded
  useEffect(() => {
    if (participants) {
      setSelectedParticipants(participants);
    }
  }, [participants]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...files]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !memoryDate) {
      return;
    }

    const success = await updateMemory(
      title,
      description,
      memoryDate,
      musicUrl,
      isPublic,
      isFavorite,
      newImages,
      selectedParticipants
    );

    if (success) {
      onSave();
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Carregando memória...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Memória não encontrada.</p>
            <Button onClick={onCancel} className="mt-4">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <MemoryFormHeader onCancel={onCancel} title="Editar Memória" />
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <BasicFields
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              memoryDate={memoryDate}
              setMemoryDate={setMemoryDate}
            />

            <PrivacyControl
              isPublic={isPublic}
              setIsPublic={setIsPublic}
            />

            {/* People Tag Selector */}
            <PeopleTagSelector
              selectedTags={selectedParticipants}
              onTagsChange={setSelectedParticipants}
              disabled={updating}
            />

            {/* Existing Images */}
            {memoryImages.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Imagens Atuais
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {memoryImages.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.image_url}
                        alt="Imagem da memória"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-8 w-8 p-0"
                        onClick={() => removeImage(image.id, image.image_url)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Adicionar Novas Imagens
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="new-images-upload"
                />
                <label
                  htmlFor="new-images-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Clique para selecionar novas imagens
                  </span>
                </label>
              </div>

              {/* Preview New Images */}
              {newImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Nova imagem ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-8 w-8 p-0"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <MusicField
              musicUrl={musicUrl}
              setMusicUrl={setMusicUrl}
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-favorite"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="is-favorite" className="text-sm font-medium text-gray-700">
                Marcar como favorita
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={updating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
