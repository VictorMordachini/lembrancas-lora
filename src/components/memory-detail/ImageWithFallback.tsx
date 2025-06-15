
import { useState } from 'react';
import { ImageIcon, ZoomIn } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const ImageWithFallback = ({ src, alt, className, onClick }: ImageWithFallbackProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
    console.error('Failed to load image:', src);
  };

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {imageLoading && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {imageError ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
          <ImageIcon className="w-8 h-8 mb-2" />
          <span className="text-sm">Erro ao carregar</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-200 ${
            onClick ? 'hover:scale-105 cursor-pointer' : ''
          } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={onClick}
        />
      )}
      
      {onClick && !imageError && !imageLoading && (
        <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
