
import { ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ImageWithFallback } from './ImageWithFallback';

interface MemoryImage {
  id: string;
  image_url: string;
  memory_id: string;
}

interface ImageGalleryProps {
  memoryTitle: string;
  dumpImageUrl?: string | null;
  memoryImages: MemoryImage[];
}

export const ImageGallery = ({ memoryTitle, dumpImageUrl, memoryImages }: ImageGalleryProps) => {
  const allImages = [
    ...(dumpImageUrl ? [{ url: dumpImageUrl, type: 'dump' as const }] : []),
    ...memoryImages.map(img => ({ url: img.image_url, type: 'uploaded' as const, id: img.id }))
  ];

  if (allImages.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-8 text-center">
        <ImageIcon className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <p className="text-slate-500">Nenhuma imagem encontrada para esta memória</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-blue-500" />
        Imagens da Memória ({allImages.length})
      </h3>
      
      {/* Main dump image if exists */}
      {dumpImageUrl && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-slate-700 mb-3">Colagem Principal</h4>
          <Dialog>
            <DialogTrigger asChild>
              <div className="group cursor-pointer">
                <ImageWithFallback
                  src={dumpImageUrl}
                  alt={`${memoryTitle} - Colagem`}
                  className="aspect-video w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => {}}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] p-2">
              <div className="w-full h-full">
                <ImageWithFallback
                  src={dumpImageUrl}
                  alt={`${memoryTitle} - Colagem`}
                  className="w-full h-auto max-h-[85vh] rounded-lg"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Individual uploaded images */}
      {memoryImages.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-slate-700 mb-3">
            Imagens Originais ({memoryImages.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memoryImages.map((image, index) => (
              <Dialog key={image.id}>
                <DialogTrigger asChild>
                  <div className="group cursor-pointer">
                    <ImageWithFallback
                      src={image.image_url}
                      alt={`${memoryTitle} - Imagem ${index + 1}`}
                      className="aspect-square rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      onClick={() => {}}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] p-2">
                  <div className="w-full h-full">
                    <ImageWithFallback
                      src={image.image_url}
                      alt={`${memoryTitle} - Imagem ${index + 1}`}
                      className="w-full h-auto max-h-[85vh] rounded-lg"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
