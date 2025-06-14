
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface MemoryFormHeaderProps {
  onCancel: () => void;
}

export const MemoryFormHeader = ({ onCancel }: MemoryFormHeaderProps) => {
  return (
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
  );
};
