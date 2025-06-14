
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Memory {
  id: string;
  title: string;
  description: string | null;
  memory_date: string;
  music_url: string | null;
  dump_image_url: string | null;
  created_at: string;
}

export const MemoryOfTheDay = () => {
  const [todayMemories, setTodayMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTodayMemories = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11
      const currentYear = today.getFullYear();

      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id)
        .neq('memory_date', format(today, 'yyyy-MM-dd')) // Exclude today's memories
        .filter('memory_date', 'like', `%-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`)
        .order('memory_date', { ascending: false });

      if (error) throw error;

      // Additional filtering to ensure exact day/month match (since LIKE might be imprecise)
      const filteredMemories = data?.filter(memory => {
        const memoryDate = parseISO(memory.memory_date);
        if (!isValid(memoryDate)) return false;
        
        return memoryDate.getDate() === currentDay && 
               memoryDate.getMonth() + 1 === currentMonth &&
               memoryDate.getFullYear() !== currentYear;
      }) || [];

      setTodayMemories(filteredMemories);
    } catch (error: any) {
      console.error('Error fetching today memories:', error);
      toast.error(`Erro ao carregar memórias do dia: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTodayMemories();
    }
  }, [user]);

  const getYearsAgo = (memoryDate: string) => {
    const memory = parseISO(memoryDate);
    const today = new Date();
    if (!isValid(memory)) return '';
    
    const yearsAgo = today.getFullYear() - memory.getFullYear();
    return yearsAgo;
  };

  const formatMemoryDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Data inválida';
      
      return format(date, "d 'de' MMMM, yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-blue-200 rounded"></div>
            <div className="h-6 w-48 bg-blue-200 rounded"></div>
          </div>
          <div className="h-4 w-full bg-blue-200 rounded mb-2"></div>
          <div className="h-4 w-2/3 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (todayMemories.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-blue-800">
            Memórias do Dia
          </h2>
        </div>
        
        <div className="space-y-4">
          {todayMemories.map((memory) => {
            const yearsAgo = getYearsAgo(memory.memory_date);
            return (
              <Card key={memory.id} className="bg-white/70 backdrop-blur-sm border-blue-100 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {memory.dump_image_url && (
                      <div className="flex-shrink-0">
                        <img 
                          src={memory.dump_image_url} 
                          alt={memory.title}
                          className="w-full sm:w-24 sm:h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                          {memory.title}
                        </h3>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 self-start">
                          {yearsAgo === 1 ? 'Há 1 ano' : `Há ${yearsAgo} anos`}
                        </Badge>
                      </div>
                      
                      {memory.description && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {memory.description}
                        </p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>
                            Neste dia, {yearsAgo === 1 ? 'há 1 ano' : `há ${yearsAgo} anos`}
                          </span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatMemoryDate(memory.memory_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
