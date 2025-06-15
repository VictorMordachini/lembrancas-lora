
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MemoryFormHeaderProps {
  onCancel: () => void;
  title?: string;
}

export const MemoryFormHeader = ({ onCancel, title = "Criar Nova Memória" }: MemoryFormHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
      <CardTitle className="text-2xl font-bold text-gray-800">
        {title}
      </CardTitle>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </Button>
    </CardHeader>
  );
};
