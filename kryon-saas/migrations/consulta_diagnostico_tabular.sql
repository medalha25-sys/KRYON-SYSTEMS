-- ==============================================================================
-- KRYON SYSTEMS — CONSULTA DIAGNÓSTICA TABULAR (100% SOMENTE LEITURA)
-- DATA: 03/09/2026
-- OBJETIVO: RETORNAR TODAS AS MÉTRICAS EM FORMATO DE TABELA (SELECT PURO)
-- REGRAS: ZERO DDL / ZERO DML / TOLERÂNCIA A TABELAS INEXISTENTES
-- ==============================================================================

WITH diagnostic_data AS (
    -- 1. Status e Tipo de public.tenants
    SELECT 
        '1. ESTRUTURA LEGADA' AS categoria,
        'Existência e tipo de public.tenants' AS indicador,
        COALESCE(
            (SELECT table_type FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants'),
            'Não existe no schema public'
        ) AS valor,
        1 AS ordem

    UNION ALL

    -- 2. Total de registros em public.tenants
    SELECT 
        '1. ESTRUTURA LEGADA' AS categoria,
        'Total de registros em public.tenants' AS indicador,
        CASE 
            WHEN to_regclass('public.tenants') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.tenants', false, false, '')))[1]::text, '0')
            ELSE 'Tabela/View inexistente'
        END AS valor,
        2 AS ordem

    UNION ALL

    -- 3. Total de organizações em public.organizations
    SELECT 
        '2. INFRAESTRUTURA CENTRAL' AS categoria,
        'Total de organizações em public.organizations' AS indicador,
        CASE 
            WHEN to_regclass('public.organizations') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.organizations', false, false, '')))[1]::text, '0')
            ELSE 'Tabela inexistente'
        END AS valor,
        3 AS ordem

    UNION ALL

    -- 4. Total de produtos cadastrados em public.products
    SELECT 
        '2. INFRAESTRUTURA CENTRAL' AS categoria,
        'Total de produtos em public.products' AS indicador,
        CASE 
            WHEN to_regclass('public.products') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.products', false, false, '')))[1]::text, '0')
            ELSE 'Tabela inexistente'
        END AS valor,
        4 AS ordem

    UNION ALL

    -- 5. Total de perfis em public.profiles
    SELECT 
        '2. INFRAESTRUTURA CENTRAL' AS categoria,
        'Total de perfis em public.profiles' AS indicador,
        CASE 
            WHEN to_regclass('public.profiles') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.profiles', false, false, '')))[1]::text, '0')
            ELSE 'Tabela inexistente'
        END AS valor,
        5 AS ordem

    UNION ALL

    -- 6. Total de usuários em auth.users
    SELECT 
        '3. AUTENTICAÇÃO' AS categoria,
        'Total de usuários no Supabase Auth' AS indicador,
        CASE 
            WHEN to_regclass('auth.users') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM auth.users', false, false, '')))[1]::text, '0')
            ELSE 'Sem acesso ao schema auth'
        END AS valor,
        6 AS ordem

    UNION ALL

    -- 7. Total de serviços em public.services
    SELECT 
        '4. MÓDULO LAVA RÁPIDO' AS categoria,
        'Total de serviços em public.services' AS indicador,
        CASE 
            WHEN to_regclass('public.services') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.services', false, false, '')))[1]::text, '0')
            ELSE 'Tabela inexistente'
        END AS valor,
        7 AS ordem

    UNION ALL

    -- 8. Total de clientes em public.customers
    SELECT 
        '4. MÓDULO LAVA RÁPIDO' AS categoria,
        'Total de clientes em public.customers' AS indicador,
        CASE 
            WHEN to_regclass('public.customers') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.customers', false, false, '')))[1]::text, '0')
            ELSE 'Tabela inexistente'
        END AS valor,
        8 AS ordem

    UNION ALL

    -- 9. Total de agendamentos em public.appointments
    SELECT 
        '4. MÓDULO LAVA RÁPIDO' AS categoria,
        'Total de agendamentos em public.appointments' AS indicador,
        CASE 
            WHEN to_regclass('public.appointments') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.appointments', false, false, '')))[1]::text, '0')
            ELSE 'Tabela inexistente'
        END AS valor,
        9 AS ordem

    UNION ALL

    -- 10. Total de feedbacks em public.feedbacks
    SELECT 
        '4. MÓDULO LAVA RÁPIDO' AS categoria,
        'Total de avaliações em public.feedbacks' AS indicador,
        CASE 
            WHEN to_regclass('public.feedbacks') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.feedbacks', false, false, '')))[1]::text, '0')
            ELSE 'Tabela inexistente'
        END AS valor,
        10 AS ordem

    UNION ALL

    -- 11. Quantidade de tenant_id distintos
    SELECT 
        '5. ISOLAMENTO MULTI-TENANT' AS categoria,
        'Tenant_IDs distintos (Services / Customers / Appointments)' AS indicador,
        CONCAT(
            'Services: ', 
            CASE WHEN to_regclass('public.services') IS NOT NULL THEN COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(DISTINCT tenant_id) FROM public.services', false, false, '')))[1]::text, '0') ELSE '0' END,
            ' | Customers: ',
            CASE WHEN to_regclass('public.customers') IS NOT NULL THEN COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(DISTINCT tenant_id) FROM public.customers', false, false, '')))[1]::text, '0') ELSE '0' END,
            ' | Appointments: ',
            CASE WHEN to_regclass('public.appointments') IS NOT NULL THEN COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(DISTINCT tenant_id) FROM public.appointments', false, false, '')))[1]::text, '0') ELSE '0' END
        ) AS valor,
        11 AS ordem

    UNION ALL

    -- 12. Serviços órfãos sem organization
    SELECT 
        '6. INTEGRIDADE REFERENCIAL' AS categoria,
        'Serviços órfãos (tenant_id sem correspondência em organizations)' AS indicador,
        CASE 
            WHEN to_regclass('public.services') IS NOT NULL AND to_regclass('public.organizations') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.services s LEFT JOIN public.organizations o ON s.tenant_id = o.id WHERE o.id IS NULL AND s.tenant_id IS NOT NULL', false, false, '')))[1]::text, '0')
            ELSE 'Tabela(s) inexistente(s)'
        END AS valor,
        12 AS ordem

    UNION ALL

    -- 13. Clientes órfãos sem organization
    SELECT 
        '6. INTEGRIDADE REFERENCIAL' AS categoria,
        'Clientes órfãos (tenant_id sem correspondência em organizations)' AS indicador,
        CASE 
            WHEN to_regclass('public.customers') IS NOT NULL AND to_regclass('public.organizations') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.customers c LEFT JOIN public.organizations o ON c.tenant_id = o.id WHERE o.id IS NULL AND c.tenant_id IS NOT NULL', false, false, '')))[1]::text, '0')
            ELSE 'Tabela(s) inexistente(s)'
        END AS valor,
        13 AS ordem

    UNION ALL

    -- 14. Agendamentos órfãos sem organization
    SELECT 
        '6. INTEGRIDADE REFERENCIAL' AS categoria,
        'Agendamentos órfãos (tenant_id sem correspondência em organizations)' AS indicador,
        CASE 
            WHEN to_regclass('public.appointments') IS NOT NULL AND to_regclass('public.organizations') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.appointments a LEFT JOIN public.organizations o ON a.tenant_id = o.id WHERE o.id IS NULL AND a.tenant_id IS NOT NULL', false, false, '')))[1]::text, '0')
            ELSE 'Tabela(s) inexistente(s)'
        END AS valor,
        14 AS ordem

    UNION ALL

    -- 15. Organizações sem nenhum membro vinculado
    SELECT 
        '6. INTEGRIDADE REFERENCIAL' AS categoria,
        'Organizações sem nenhum membro em organization_members' AS indicador,
        CASE 
            WHEN to_regclass('public.organizations') IS NOT NULL AND to_regclass('public.organization_members') IS NOT NULL THEN
                COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.organizations o LEFT JOIN public.organization_members om ON o.id = om.organization_id WHERE om.id IS NULL', false, false, '')))[1]::text, '0')
            ELSE 'Tabela(s) inexistente(s)'
        END AS valor,
        15 AS ordem
)
SELECT 
    categoria AS "Categoria",
    indicador AS "Indicador / Métrica",
    valor AS "Valor Detectado"
FROM diagnostic_data
ORDER BY ordem ASC;
