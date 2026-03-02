-- Renomear Organização Padrão
UPDATE public.organizations 
SET name = 'Concrete Kryon Systems' 
WHERE name = 'Clínica Principal';

-- Verificar alteração
SELECT id, name FROM public.organizations WHERE name = 'Concrete Kryon Systems';
