
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BasicFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  memoryDate: string;
  setMemoryDate: (date: string) => void;
}

export const BasicFields = ({
  title,
  setTitle,
  description,
  setDescription,
  memoryDate,
  setMemoryDate
}: BasicFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          Título da Memória *
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Viagem para a praia"
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-slate-700">
          Descrição
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Conte mais sobre essa memória especial..."
          className="w-full h-24 resize-none"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="memory-date" className="text-sm font-medium text-slate-700">
          Data da Memória *
        </label>
        <Input
          id="memory-date"
          type="date"
          value={memoryDate}
          onChange={(e) => setMemoryDate(e.target.value)}
          className="w-full"
          required
        />
      </div>
    </>
  );
};
