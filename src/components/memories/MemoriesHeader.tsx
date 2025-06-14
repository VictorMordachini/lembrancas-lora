
import { Button } from '@/components/ui/button';
import { Plus, LogOut, User, Heart, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MemoriesHeaderProps {
  onNewMemory: () => void;
  onShowProfile: () => void;
  onSignOut: () => void;
}

export const MemoriesHeader = ({ onNewMemory, onShowProfile, onSignOut }: MemoriesHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/6be612b2-2efe-4135-ab7b-60dcc88c8ad0.png" 
            alt="Memórias Logo" 
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Minhas Memórias</h1>
            <p className="text-sm text-slate-500 hidden sm:block">Suas lembranças especiais</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={onNewMemory}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 px-4 sm:px-6"
            size="default"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nova Memória</span>
            <span className="sm:hidden">Nova</span>
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="icon"
            className="hover:bg-slate-100 transition-colors"
            title="Ver feed público"
          >
            <Globe className="w-4 h-4 text-blue-500" />
          </Button>
          <Button
            onClick={() => navigate('/favorites')}
            variant="outline"
            size="icon"
            className="hover:bg-slate-100 transition-colors"
          >
            <Heart className="w-4 h-4 text-red-500" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={onShowProfile}
            className="hover:bg-slate-100 transition-colors"
          >
            <User className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={onSignOut}
            className="hidden sm:flex items-center gap-2 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={onSignOut}
            className="sm:hidden hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
