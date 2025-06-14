
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Upload, Music, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImages = async (memoryId: string) => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${memoryId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('memory-images')
        .upload(filePath, image);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('memory-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const createCollage = async (imageUrls: string[], memoryId: string, memoryTitle: string) => {
    try {
      console.log('Criando colagem para memória:', memoryId);
      
      const { data, error } = await supabase.functions.invoke('create-memory-collage', {
        body: {
          imageUrls,
          memoryId,
          title: memoryTitle
        }
      });

      if (error) {
        console.error('Erro ao criar colagem:', error);
        // Se falhar, retorna a primeira imagem como fallback
        return imageUrls[0] || null;
      }

      console.log('Colagem criada com sucesso:', data?.collageUrl);
      return data?.collageUrl || imageUrls[0] || null;
    } catch (error) {
      console.error('Erro na função de colagem:', error);
      // Se falhar, retorna a primeira imagem como fallback
      return imageUrls[0] || null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Criar a memória primeiro
      const { data: memory, error: memoryError } = await supabase
        .from('memories')
        .insert({
          title,
          description: description || null,
          memory_date: memoryDate,
          music_url: musicUrl || null,
          user_id: user.id
        })
        .select()
        .single();

      if (memoryError) throw memoryError;

      // Upload das imagens
      let dumpImageUrl = null;
      if (images.length > 0) {
        toast.success('Fazendo upload das imagens...');
        const uploadedUrls = await uploadImages(memory.id);
        
        if (uploadedUrls.length > 0) {
          // Salvar URLs das imagens na tabela memory_images
          for (const url of uploadedUrls) {
            await supabase
              .from('memory_images')
              .insert({
                memory_id: memory.id,
                image_url: url
              });
          }

          // Criar colagem automática
          toast.success('Criando colagem das imagens...');
          dumpImageUrl = await createCollage(uploadedUrls, memory.id, title);

          // Atualizar memória com dump image URL
          if (dumpImageUrl) {
            await supabase
              .from('memories')
              .update({ dump_image_url: dumpImageUrl })
              .eq('id', memory.id);
          }
        }
      }

      toast.success('Memória criada com sucesso!');
      onSave();
    } catch (error: any) {
      toast.error(`Erro ao criar memória: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Calendar className="w-5 h-5" />
          Nova Memória
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da sua memória"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva sua memória..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memoryDate">Data da Memória</Label>
            <Input
              id="memoryDate"
              type="date"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="musicUrl">URL da Música (opcional)</Label>
            <div className="flex">
              <div className="flex items-center justify-center px-3 bg-slate-100 border border-r-0 rounded-l-md">
                <Music className="w-4 h-4 text-slate-500" />
              </div>
              <Input
                id="musicUrl"
                value={musicUrl}
                onChange={(e) => setMusicUrl(e.target.value)}
                placeholder="https://..."
                className="rounded-l-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Imagens (opcional)</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center px-3 py-2 bg-slate-100 border rounded-md cursor-pointer hover:bg-slate-200">
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="images" className="flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Escolher imagens</span>
                </label>
              </div>
              {images.length > 0 && (
                <span className="text-sm text-slate-600">{images.length} arquivo(s) selecionado(s)</span>
              )}
            </div>
            
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-md">
                      <span className="text-xs text-slate-600">{image.name}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar Memória'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
