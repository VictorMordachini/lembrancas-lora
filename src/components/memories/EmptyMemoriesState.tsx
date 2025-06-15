
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyMemoriesStateProps {
  onCreateFirst: () => void;
}

export const EmptyMemoriesState = ({ onCreateFirst }: EmptyMemoriesStateProps) => {
  return (
    <div className="text-center py-20">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <img 
            src="/lovable-uploads/6be612b2-2efe-4135-ab7b-60dcc88c8ad0.png" 
            alt="Memórias Logo" 
            className="w-10 h-10 opacity-60"
          />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          Nenhuma memória ainda
        </h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Comece criando sua primeira memória especial e guarde seus momentos mais importantes para sempre.
        </p>
        <Button 
          onClick={onCreateFirst} 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 px-8 py-3 text-lg"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Criar primeira memória
        </Button>
      </div>
    </div>
  );
};
