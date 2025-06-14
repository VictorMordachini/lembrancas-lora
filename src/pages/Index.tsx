
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PublicFeed from './PublicFeed';
import Memories from './Memories';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-slate-600">Carregando...</div>
      </div>
    );
  }

  // Se o usuário está logado, mostrar suas memórias
  if (user) {
    return <Memories />;
  }

  // Se não está logado, mostrar o feed público
  return <PublicFeed />;
};

export default Index;
