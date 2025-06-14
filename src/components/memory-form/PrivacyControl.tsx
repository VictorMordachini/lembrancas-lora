
import { Switch } from '@/components/ui/switch';
import { Globe, Lock } from 'lucide-react';

interface PrivacyControlProps {
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
}

export const PrivacyControl = ({ isPublic, setIsPublic }: PrivacyControlProps) => {
  return (
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
  );
};
