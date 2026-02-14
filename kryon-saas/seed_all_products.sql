-- EXECUTAR ESTE SCRIPT NO SQL EDITOR DO SUPABASE
-- Este script garante que todos os slugs usados no site existam no banco de dados.

-- 1. Garante que as colunas extras existam (se houver atualização no schema)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features TEXT[];

-- 2. Insere ou Atualiza todos os produtos/verticalizados
INSERT INTO public.products (slug, name, description, price, features)
VALUES 
    ('agenda-facil', 'Agenda Fácil', 'Sistema de agendamento online inteligente.', 77.00, '{"Agendamento Online", "Lembretes WhatsApp", "Gestão de Clientes"}'),
    ('gestao-pet', 'Gestão Pet', 'Controle completo para Pet Shops e Clínicas Veterinárias.', 97.00, '{"Agendamento Banho e Tosa", "Prontuário Pet", "Controle de Vacinas"}'),
    ('tech-assist', 'Systems Celulares', 'Gestão de ordens de serviço e estoque para assistências técnicas.', 97.00, '{"Ordens de Serviço", "Controle de IMEI", "Estoque de Peças"}'),
    ('fashion-manager', 'Sistema de Loja de Roupas e Calçados com IA', 'Controle de vendas e grade para lojas de roupas.', 97.00, '{"Grade de Tamanhos", "Controle de Condicional", "PDV Rápido"}'),
    ('galeria-pro', 'Systems Fotos', 'Seleção de fotos e entrega digital para fotógrafos.', 87.00, '{"Seleção de Fotos", "Marca d''água Automática", "Entrega Digital"}'),
    ('decor-manager', 'Sistema para Loja de Decoração', 'Gestão para lojas de decoração e móveis.', 127.00, '{"Orçamentos Personalizados", "Catálogo Digital", "Controle de Entregas"}'),
    ('lava-rapido', 'Lava Car Pro', 'Gestão de lava rápidos e estética automotiva.', 87.00, '{"Agendamento Web", "Fidelidade", "Controle de Lavagens"}'),
    ('mechanic', 'Auto Mecânica', 'Sistema para oficinas e auto centers.', 127.00, '{"Ordem de Serviço", "Histórico do Veículo", "Busca por Placa"}'),
    ('legal-desk', 'Sistema de Gestão Jurídica (LegalTech)', 'Gestão de processos e prazos para advogados.', 147.00, '{"Controle Processual", "Agenda de Prazos", "Financeiro"}'),
    -- Fallbacks para os botões de planos genéricos
    ('basic', 'Plano Básico', 'Kryon Systems - Solução Geral Versão Básica.', 47.00, '{"Gestão Essencial", "Relatórios Simples"}'),
    ('essential', 'Plano Essencial', 'Kryon Systems - Solução Geral Versão Completa.', 97.00, '{"Gestão Completa", "Suporte Prioritário"}'),
    ('pro', 'Plano Pro', 'Kryon Systems - Solução Enterprise.', 197.00, '{"Multiusuários", "API Rest", "Dashboard Avançado"}')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    features = EXCLUDED.features;
