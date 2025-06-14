
import { Input } from '@/components/ui/input';
import { Music } from 'lucide-react';

interface MusicFieldProps {
  musicUrl: string;
  setMusicUrl: (url: string) => void;
}

export const MusicField = ({ musicUrl, setMusicUrl }: MusicFieldProps) => {
  return (
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
  );
};
