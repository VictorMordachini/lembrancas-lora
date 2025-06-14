
import { useAuth } from '@/hooks/useAuth';
import PublicFeed from './PublicFeed';

const Index = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-slate-600">Carregando...</div>
      </div>
    );
  }

  // Sempre mostrar o feed público como página inicial
  return <PublicFeed />;
};

export default Index;
