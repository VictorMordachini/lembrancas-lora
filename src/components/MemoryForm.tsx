
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera, Music, Upload, Globe, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (memoryId: string) => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${memoryId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('memory-images')
        .upload(fileName, image);

      if (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('memory-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const createCollage = async (imageUrls: string[], memoryId: string, title: string) => {
    if (imageUrls.length === 0) return null;

    try {
      const { data, error } = await supabase.functions.invoke('create-memory-collage', {
        body: { 
          imageUrls, 
          memoryId, 
          title 
        }
      });

      if (error) throw error;
      return data.collageUrl;
    } catch (error) {
      console.error('Erro ao criar colagem:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !memoryDate) {
      toast.error('Por favor, preencha pelo menos o título e a data da memória.');
      return;
    }

    if (!user) {
      toast.error('Você precisa estar logado para criar uma memória.');
      return;
    }

    setLoading(true);

    try {
      // 1. Criar a memória primeiro
      const { data: memory, error: memoryError } = await supabase
        .from('memories')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          memory_date: memoryDate,
          music_url: musicUrl.trim() || null,
          user_id: user.id,
          is_public: isPublic
        })
        .select()
        .single();

      if (memoryError) throw memoryError;

      let finalDumpImageUrl = null;

      // 2. Se há imagens, fazer upload e criar colagem
      if (images.length > 0) {
        toast.info('Fazendo upload das imagens...');
        const uploadedUrls = await uploadImages(memory.id);
        
        if (uploadedUrls.length > 0) {
          // Salvar URLs individuais na tabela memory_images
          for (const url of uploadedUrls) {
            await supabase
              .from('memory_images')
              .insert({
                memory_id: memory.id,
                image_url: url
              });
          }

          // Criar colagem
          toast.info('Gerando colagem automática...');
          finalDumpImageUrl = await createCollage(uploadedUrls, memory.id, title);
          
          if (finalDumpImageUrl) {
            toast.success('Colagem criada com sucesso!');
          } else {
            toast.warning('Não foi possível criar a colagem, mas as imagens foram salvas.');
            // Se não conseguir criar colagem, usar a primeira imagem
            finalDumpImageUrl = uploadedUrls[0];
          }
        }
      }

      // 3. Atualizar a memória com a URL da colagem/imagem
      if (finalDumpImageUrl) {
        await supabase
          .from('memories')
          .update({ dump_image_url: finalDumpImageUrl })
          .eq('id', memory.id);
      }

      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar memória:', error);
      toast.error(`Erro ao salvar memória: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Nova Memória
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-slate-700">
                Título da Memória *
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Viagem para a praia"
                className="w-full"
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-slate-700">
                Descrição
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conte mais sobre essa memória especial..."
                className="w-full h-24 resize-none"
              />
            </div>

            {/* Data da Memória */}
            <div className="space-y-2">
              <label htmlFor="memory-date" className="text-sm font-medium text-slate-700">
                Data da Memória *
              </label>
              <Input
                id="memory-date"
                type="date"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Privacidade */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Privacidade
              </label>
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Globe className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <p className="font-medium text-slate-800">
                      {isPublic ? 'Memória Pública' : 'Memória Privada'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {isPublic 
                        ? 'Qualquer pessoa poderá ver esta memória no feed público'
                        : 'Apenas você poderá ver esta memória'
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            </div>

            {/* Upload de Imagens */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Imagens da Memória
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Camera className="w-8 h-8 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    Clique para adicionar imagens
                  </span>
                  <span className="text-xs text-slate-400">
                    PNG, JPG até 10MB cada
                  </span>
                </label>
              </div>

              {/* Preview das imagens */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* URL da Música */}
            <div className="space-y-2">
              <label htmlFor="music-url" className="text-sm font-medium text-slate-700">
                Link da Música (opcional)
              </label>
              <div className="relative">
                <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="music-url"
                  type="url"
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  placeholder="https://spotify.com/..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Botões */}
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
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
