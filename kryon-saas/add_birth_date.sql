-- ADICIONA COLUNA DE DATA DE NASCIMENTO
-- Necessário para a funcionalidade de Feliz Aniversário
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
