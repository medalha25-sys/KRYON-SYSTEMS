-- ==============================================================================
-- KRYON SYSTEMS — DIAGNÓSTICO PROFUNDO: PROFILES, ORGANIZATIONS & TENANTS
-- BANCO: Sistemas Kryon (pgpobxvkojawrstadrel.supabase.co)
-- OBJETIVO: LEVANTAMENTO COMPLETO DE ESTRUTURA, DADOS E DEFINIÇÃO DO TRIGGER
-- ==============================================================================

-- 1. Estrutura e Colunas de public.profiles
SELECT 
    '1. PROFILES COLUNAS' AS categoria,
    column_name AS nome,
    data_type || ' | nullable: ' || is_nullable || ' | default: ' || COALESCE(column_default, 'NONE') AS detalhes
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'

UNION ALL

-- 2. Constraints de public.profiles
SELECT 
    '2. PROFILES CONSTRAINTS' AS categoria,
    tc.constraint_name AS nome,
    tc.constraint_type || ' (' || kcu.column_name || ' -> ' || COALESCE(ccu.table_name || '.' || ccu.column_name, 'NONE') || ')' AS detalhes
FROM information_schema.table_constraints tc 
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema 
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema 
WHERE tc.table_schema = 'public' AND tc.table_name = 'profiles'

UNION ALL

-- 3. Linhas Atuais em public.organizations
SELECT 
    '3. LINHAS ORGANIZATIONS' AS categoria,
    name || ' (' || slug || ')' AS nome,
    'id: ' || id::text || ' | owner_id: ' || COALESCE(owner_id::text, 'NULL') || ' | status: ' || status AS detalhes
FROM public.organizations

UNION ALL

-- 4. Linhas Atuais em public.profiles
SELECT 
    '4. LINHAS PROFILES' AS categoria,
    'Profile ID: ' || id::text AS nome,
    'org_id: ' || COALESCE(organization_id::text, 'NULL') || ' | tenant_id: ' || COALESCE(tenant_id::text, 'NULL') || ' | role: ' || COALESCE(role, 'NULL') AS detalhes
FROM public.profiles

UNION ALL

-- 5. Colunas de public.tenants
SELECT 
    '5. TENANTS COLUNAS' AS categoria,
    column_name AS nome,
    data_type || ' | nullable: ' || is_nullable || ' | default: ' || COALESCE(column_default, 'NONE') AS detalhes
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'tenants'

UNION ALL

-- 6. Triggers em public.organizations
SELECT 
    '6. TRIGGERS EM ORGANIZATIONS' AS categoria,
    trigger_name AS nome,
    action_timing || ' ' || event_manipulation || ' -> ' || action_statement AS detalhes
FROM information_schema.triggers 
WHERE event_object_schema = 'public' AND event_object_table = 'organizations';
