-- Add new products to the products table

-- 0. Ensure columns exist (Safety Check)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features TEXT[];

-- 1. Tech Assist (Loja de Celular)
INSERT INTO public.products (slug, name, description, price, features)
VALUES 
    ('tech-assist', 'Tech Control', 'Sistema para assistências técnicas e lojas de celulares. Controle OS, vendas e estoque.', 97.00, '{"Ordens de Serviço", "Controle de IMEI", "Vendas e Caixa", "Estoque de Peças"}')
ON CONFLICT (slug) DO UPDATE SET 
    name = 'Tech Control',
    description = 'Sistema para assistências técnicas e lojas de celulares. Controle OS, vendas e estoque.',
    price = EXCLUDED.price,
    features = EXCLUDED.features;

-- 2. Loja de Roupas
INSERT INTO public.products (slug, name, description, price, features)
VALUES 
    ('loja-roupas', 'Style Store', 'Gestão completa para lojas de roupas e acessórios. Controle de grade, condicional e PDV.', 97.00, '{"Grade de Tamanhos", "Controle de Condicional", "Etiquetas e Código de Barras", "Crediário Próprio"}')
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    features = EXCLUDED.features;

-- 3. Mecânica
INSERT INTO public.products (slug, name, description, price, features)
VALUES 
    ('mecanica', 'Auto Mecânica', 'Sistema para oficinas mecânicas e auto centers. Orçamentos, placas e revisões.', 127.00, '{"Ordem de Serviço Veicular", "Busca por Placa", "Histórico de Revisões", "Controle de Peças"}')
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    features = EXCLUDED.features;

-- 4. Advogado
INSERT INTO public.products (slug, name, description, price, features)
VALUES 
    ('advogado', 'Juridical Pro', 'Gestão de processos e prazos para advogados e escritórios de advocacia.', 147.00, '{"Controle de Processos", "Agenda de Prazos", "Gestão de Clientes", "Financeiro"}')
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    features = EXCLUDED.features;

-- 5. Fotógrafos
INSERT INTO public.products (slug, name, description, price, features)
VALUES 
    ('fotografo', 'Studio Lens', 'Gestão de ensaios, seleção de fotos e agenda para fotógrafos.', 87.00, '{"Agendamento de Ensaios", "Seleção de Fotos (Galeria)", "Contratos Digitais", "Financeiro"}')
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    features = EXCLUDED.features;

-- 6. Loja de Decoração (Decora Pro)
INSERT INTO public.products (slug, name, description, price, features)
VALUES 
    ('loja-decoracao', 'Decora Pro', 'Simulador de ambientes e gestão para lojas de decoração e papel de parede.', 127.00, '{"Simulador de Ambientes", "Catálogo Digital", "Orçamentos Rápidos", "Gestão de Clientes"}')
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    features = EXCLUDED.features;

-- 7. Lava Rápido (Lava Car Pro)
INSERT INTO public.products (slug, name, description, price, features)
VALUES 
    ('lava-rapido', 'Lava Car Pro', 'Gestão completa para lava rápidos e estética automotiva. Agendamento e controle de serviços.', 87.00, '{"Agendamento Online", "Controle de Lavagens", "Fidelidade", "Financeiro"}')
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    features = EXCLUDED.features;