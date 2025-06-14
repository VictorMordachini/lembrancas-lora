
import { Camera } from 'lucide-react';

interface ImageUploadProps {
  images: File[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export const ImageUpload = ({ images, onImageUpload, onRemoveImage }: ImageUploadProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">
        Imagens da Memória
      </label>
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onImageUpload}
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
                onClick={() => onRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
