import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import { MemoryFormHeader } from '@/components/memory-form/MemoryFormHeader';
import { BasicFields } from '@/components/memory-form/BasicFields';
import { PrivacyControl } from '@/components/memory-form/PrivacyControl';
import { ImageUpload } from '@/components/memory-form/ImageUpload';
import { MusicField } from '@/components/memory-form/MusicField';
import { useMemorySubmit } from '@/hooks/useMemorySubmit';

interface MemoryFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export const MemoryForm = ({ onSave, onCancel }: MemoryFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  
  const { loading, submitMemory } = useMemorySubmit();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await submitMemory(
      title,
      description,
      memoryDate,
      musicUrl,
      images,
      isPublic
    );

    if (success) {
      onSave();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <MemoryFormHeader onCancel={onCancel} />
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

            <ImageUpload
              images={images}
              onImageUpload={handleImageUpload}
              onRemoveImage={removeImage}
            />

            <MusicField
              musicUrl={musicUrl}
              setMusicUrl={setMusicUrl}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Salvar Memória
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
