
-- Adicionar campo is_public à tabela memories
ALTER TABLE public.memories 
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Remover as políticas RLS existentes que impedem acesso público
DROP POLICY IF EXISTS "Users can view their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can create their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can update their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can delete their own memories" ON public.memories;

-- Criar novas políticas que permitam visualização pública de memórias marcadas como públicas
CREATE POLICY "Anyone can view public memories" 
  ON public.memories 
  FOR SELECT 
  USING (is_public = true);

-- Política para usuários visualizarem suas próprias memórias (públicas ou privadas)
CREATE POLICY "Users can view their own memories" 
  ON public.memories 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários criarem suas próprias memórias
CREATE POLICY "Users can create their own memories" 
  ON public.memories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias memórias
CREATE POLICY "Users can update their own memories" 
  ON public.memories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para usuários deletarem suas próprias memórias
CREATE POLICY "Users can delete their own memories" 
  ON public.memories 
  FOR DELETE 
  USING (auth.uid() = user_id);
