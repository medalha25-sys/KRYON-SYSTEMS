-- ==============================================================================
-- SEED DATA SQL — SISTEMA VASISTORE ERP & PDV
-- Executar no Supabase SQL Editor para carregar o catálogo oficial de produtos
-- ==============================================================================

-- 1. LOJA INICIAL (VASISTORE)
INSERT INTO public.stores (id, name, trade_name, cnpj_cpf, phone, whatsapp, email, address, number, neighborhood, city, state, zip_code, logo_url, receipt_message)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'VasiStore Gestão de Utilidades',
    'VasiStore',
    '',
    '',
    '',
    'contato@vasistore.com.br',
    '',
    '',
    '',
    '',
    '',
    '',
    '/logo.png',
    'Obrigado pela preferência! Volte sempre.'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    trade_name = EXCLUDED.trade_name,
    logo_url = EXCLUDED.logo_url;

-- 1.1 FUNCIONÁRIOS / PERFIS INICIAIS
INSERT INTO public.profiles (id, store_id, email, full_name, role, phone, password) VALUES
('e0000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001', 'weslley@donalar.com.br', 'Weslley (ADM Suporte)', 'admin', '', '15252833'),
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'suriel@donalar.com.br', 'Suriel (ADM)', 'admin', '', '123'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'joel@donalar.com.br', 'Joel (Gerente)', 'gerente', '', '123'),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'elizangela@donalar.com.br', 'Elizangela (Vendedora)', 'vendedor', '', '123'),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'caixa@donalar.com.br', 'Caixa (Operador de Caixa)', 'caixa', '', '123')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    password = EXCLUDED.password;

-- 2. CATEGORIAS DE UTILIDADES BASE
INSERT INTO public.categories (id, store_id, name, slug, description, color) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Potes e Vasilhas', 'potes-e-vasilhas', 'Potes herméticos, potes de vidro, conjuntos de vasilhas plásticas', '#16a34a'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Organizadores e Caixas', 'organizadores-e-caixas', 'Caixas organizadoras com travas, organizadores de gaveta e acrílicos', '#0284c7'),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Panelas e Frigideiras', 'panelas-e-frigideiras', 'Conjuntos de panelas antiaderentes, caçarolas, frigideiras e panelas de pressão', '#ea580c'),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Copos, Taças e Jarras', 'copos-tacas-e-jarras', 'Jogos de copos de vidro, taças e jarras graduadas', '#8b5cf6'),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Talheres e Facas', 'talheres-e-facas', 'Faqueiros inox, facas de corte e espátulas de silicone', '#64748b'),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Garrafas e Térmicas', 'garrafas-e-termicas', 'Garrafas de café térmicas, squeezes e bules', '#b45309'),
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Limpeza e Lavanderia', 'limpeza-e-lavanderia', 'Mops giratórios, baldes graduados e bacias reforçadas', '#3b82f6'),
('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Utilidades e Alumínio', 'utilidades-e-aluminio', 'Caldeirões industriais, jogos de latas, bacias e utilidades de alumínio', '#059669'),
('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Churrasco & Lazer', 'churrasco-e-lazer', 'Churrasqueiras portáteis, quadradas, meia redonda e grelhas', '#dc2626'),
('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Cama, Mesa & Decoração', 'cama-mesa-e-decoracao', 'Travesseiros confortáveis, almofadas de sofá e itens para o lar', '#d97706'),
('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'Calçados & Vestuário', 'calcados-e-vestuario', 'Botinas de couro reforçadas, calçados e botas de trabalho', '#78350f')
ON CONFLICT (id) DO NOTHING;

-- 3. CATÁLOGO OFICIAL DE PRODUTOS
INSERT INTO public.products (id, store_id, category_id, sku, barcode, name, description, brand, unit, cost_price, sale_price, current_stock, min_stock, max_stock) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1001', '7892026001015', 'Jogo de panelas coloridas tampo de vidro', 'Conjunto completo de panelas coloridas com tampa de vidro temperado e saída de vapor.', 'Nacional', 'kit', 160.00, 285.00, 10, 3, 30),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1002', '7892026001022', 'Jogo de panelas coloridas tampo comum', 'Conjunto de panelas coloridas resistentes com tampa de alumínio tradicional.', 'Nacional', 'kit', 105.00, 185.00, 12, 3, 30),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1003', '7892026001039', 'Panela alumínio batido 6,5 L', 'Panela reforçada em alumínio fundido/batido grosso com capacidade de 6,5 litros.', 'Alumínio Forte', 'unidade', 105.00, 185.00, 15, 4, 40),
('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1004', '7892026001046', 'Panela alumínio claro 6,5 L', 'Panela em alumínio polido claro de alta qualidade com 6,5 litros.', 'Alumínio Forte', 'unidade', 98.00, 175.00, 15, 4, 40),
('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1005', '7892026001053', 'Panela alumínio Preta 7,5 L', 'Panela grande com acabamento craqueado preto resistente e capacidade de 7,5 litros.', 'Alumínio Forte', 'unidade', 105.00, 185.00, 12, 3, 30),
('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1006', '7892026001060', 'Panela alumínio escura 5,5 L', 'Panela com acabamento escuro especial de 5,5 litros.', 'Alumínio Forte', 'unidade', 92.00, 165.00, 14, 3, 35),
('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1007', '7892026001077', 'Jogo de panela preta tampa comum alumínio reforçado', 'Jogo completo de panelas pretas reforçadas com tampa de alumínio comum.', 'Alumínio Forte', 'kit', 110.00, 195.00, 10, 3, 25),
('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1008', '7892026001084', 'Jogo de panela alumínio claro fundo', 'Jogo de panelas de alumínio claro com fundo espesso para melhor distribuição de calor.', 'Alumínio Forte', 'kit', 108.00, 189.00, 10, 3, 25),
('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1009', '7892026001091', 'Panela de pressão 10 L', 'Panela de pressão de grande porte 10 litros com válvula de segurança aprovada pelo Inmetro.', 'Pressão Forte', 'unidade', 165.00, 280.00, 8, 2, 20),
('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1010', '7892026001107', 'Panela de pressão 7 L', 'Panela de pressão de 7 litros com fechamento seguro e alto rendimento térmico.', 'Pressão Forte', 'unidade', 148.00, 259.00, 10, 3, 25),
('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1011', '7892026001114', 'Panela caçarola 8,5 L', 'Caçarola grande de 8,5 litros com asas anatômicas e tampa reforçada.', 'Alumínio Forte', 'unidade', 74.00, 129.00, 15, 3, 35),
('d0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1012', '7892026001121', 'Panela caçarola 8 L', 'Caçarola de alumínio reforçado com 8 litros.', 'Alumínio Forte', 'unidade', 70.00, 124.00, 15, 3, 35),
('d0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1013', '7892026001138', 'Panela caçarola 6 L', 'Caçarola de alumínio com 6 litros, ideal para o dia a dia.', 'Alumínio Forte', 'unidade', 68.00, 119.90, 18, 4, 40),
('d0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1014', '7892026001145', 'Panela caçarola fundida preta 5,250 L', 'Caçarola em ferro/alumínio fundido preto de 5,25 litros com retenção prolongada de calor.', 'Fundição Nobre', 'unidade', 94.00, 165.00, 12, 3, 30),
('d0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1015', '7892026001152', 'Panela caçarola fundida preta 5,5 L', 'Caçarola fundida preta espessa com 5,5 litros de capacidade.', 'Fundição Nobre', 'unidade', 105.00, 185.00, 12, 3, 30),
('d0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1016', '7892026001169', 'Tacho fundido 3,5 L', 'Tacho fundido para doces, frituras e preparos artesanais com 3,5 litros.', 'Fundição Nobre', 'unidade', 80.00, 143.00, 14, 3, 30),
('d0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1017', '7892026001176', 'Frigideira alumínio batido', 'Frigideira grossa em alumínio batido com cabo de baquelite reforçado.', 'Alumínio Forte', 'unidade', 58.00, 106.80, 20, 5, 50),
('d0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1018', '7892026001183', 'Panela caçarola 22', 'Panela caçarola número 22 cm em alumínio.', 'Alumínio Forte', 'unidade', 36.00, 65.90, 25, 5, 60),
('d0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1019', '7892026001190', 'Panela caçarola 20', 'Panela caçarola número 20 cm em alumínio.', 'Alumínio Forte', 'unidade', 30.00, 55.00, 25, 5, 60),
('d0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'PAN-1020', '7892026001206', 'Jogo de panela caçarola redonda', 'Conjunto de caçarolas redondas em alumínio reforçado.', 'Alumínio Forte', 'kit', 95.00, 170.00, 12, 3, 30),
('d0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'CAL-2001', '7892026002012', 'Caldeirão 25 L', 'Caldeirão industrial de alumínio reforçado com asas reforçadas e capacidade de 25 litros.', 'Alumínio Forte', 'unidade', 105.00, 185.00, 8, 2, 20),
('d0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'CAL-2002', '7892026002029', 'Caldeirão 20 L', 'Caldeirão de alumínio grosso com capacidade de 20 litros.', 'Alumínio Forte', 'unidade', 96.00, 169.90, 10, 2, 25),
('d0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'CAL-2003', '7892026002036', 'Caldeirão 16 L', 'Caldeirão de alumínio com capacidade de 16 litros.', 'Alumínio Forte', 'unidade', 85.00, 149.90, 12, 3, 30),
('d0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'CAL-2004', '7892026002043', 'Caldeirão 14 L', 'Caldeirão de alumínio resistente de 14 litros.', 'Alumínio Forte', 'unidade', 78.00, 139.00, 12, 3, 30),
('d0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'CAL-2005', '7892026002050', 'Caldeirão 12 L', 'Caldeirão de alumínio de 12 litros.', 'Alumínio Forte', 'unidade', 72.00, 129.90, 15, 3, 35),
('d0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'CAL-2006', '7892026002067', 'Caldeirão 10 L', 'Caldeirão de alumínio de 10 litros.', 'Alumínio Forte', 'unidade', 66.00, 119.90, 15, 3, 35),
('d0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'ALU-3001', '7892026003019', 'Jogo de lata de alumínio', 'Conjunto de latas / mantimentos em alumínio com tampas herméticas.', 'Alumínio Forte', 'kit', 88.00, 159.90, 10, 3, 25),
('d0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'ALU-3002', '7892026003026', 'Bacia de alumínio grande', 'Bacia reforçada de alumínio grande para preparos culinários e lavanderia.', 'Alumínio Forte', 'unidade', 42.00, 79.90, 16, 4, 40),
('d0000000-0000-0000-0000-000000000029', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'ALU-3003', '7892026003033', 'Jogo de 5 latas de alumínio', 'Jogo completo com 5 latas de mantimentos (Arroz, Feijão, Açúcar, Café e Farinha).', 'Alumínio Forte', 'kit', 102.00, 185.00, 10, 3, 25),
('d0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000012', 'CAL-4001', '7892026004016', 'Botina amarela', 'Botina de segurança e trabalho em couro nobuck amarelo com elástico lateral e solado antiderrapante.', 'Couro Forte', 'par', 52.00, 93.90, 20, 5, 50),
('d0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000012', 'CAL-4002', '7892026004023', 'Botina marrom', 'Botina em couro legítimo marrom com acabamento reforçado e palmilha confortável.', 'Couro Forte', 'par', 68.00, 125.00, 18, 4, 45),
('d0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', 'DEC-5001', '7892026005013', 'Travesseiros', 'Travesseiro macio com fibra siliconada antialérgica e tecido toque suave.', 'Confort Lar', 'unidade', 18.00, 35.00, 30, 8, 80),
('d0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', 'DEC-5002', '7892026005020', 'Almofada de sofá', 'Almofada decorativa para sofá com enchimento confortável e capa removível.', 'Confort Lar', 'unidade', 17.50, 34.90, 30, 8, 80),
('d0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010', 'CHU-6001', '7892026006010', 'Churrasqueira meia redonda', 'Churrasqueira a carvão modelo meia redonda em chapa de aço com grelha e pés de apoio.', 'Churrasco Grill', 'unidade', 220.00, 399.90, 6, 2, 15),
('d0000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010', 'CHU-6002', '7892026006027', 'Churrasqueira quadrada desmontável', 'Churrasqueira portátil quadrada totalmente desmontável com grelha em inox.', 'Churrasco Grill', 'unidade', 210.00, 380.00, 6, 2, 15),
('d0000000-0000-0000-0000-000000000036', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010', 'CHU-6003', '7892026006034', 'Churrasqueira quadrada', 'Churrasqueira quadrada reforçada com grelha, suporte lateral e acabamento esmaltado.', 'Churrasco Grill', 'unidade', 250.00, 450.00, 5, 2, 15)
ON CONFLICT (id) DO UPDATE SET
    sale_price = EXCLUDED.sale_price,
    name = EXCLUDED.name,
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode;
