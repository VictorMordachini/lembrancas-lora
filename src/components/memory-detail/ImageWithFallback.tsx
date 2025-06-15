
import { useState, useEffect } from 'react';
import { ImageIcon, ZoomIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const ImageWithFallback = ({ src, alt, className, onClick }: ImageWithFallbackProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      // If it's already a full URL, use it directly
      if (src.startsWith('http')) {
        setSignedUrl(src);
        return;
      }

      // If it's a storage path, get signed URL
      try {
        const { data, error } = await supabase.storage
          .from('memory-images')
          .createSignedUrl(src, 3600); // 1 hour expiry

        if (error) {
          console.error('Error creating signed URL:', error);
          setImageError(true);
        } else {
          setSignedUrl(data.signedUrl);
        }
      } catch (error) {
        console.error('Error getting signed URL:', error);
        setImageError(true);
      }
    };

    getSignedUrl();
  }, [src]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
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
        signedUrl && (
          <img
            src={signedUrl}
            alt={alt}
            className={`w-full h-full object-cover transition-all duration-200 ${
              onClick ? 'hover:scale-105 cursor-pointer' : ''
            } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={onClick}
          />
        )
      )}
      
      {onClick && !imageError && !imageLoading && (
        <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
