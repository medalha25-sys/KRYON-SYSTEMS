-- ==============================================================================
-- KRYON SYSTEMS — VERIFICAÇÃO DE COLUNAS OBRIGATÓRIAS (100% SOMENTE LEITURA)
-- DATA: 03/09/2026
-- OBJETIVO: VERIFICAR SE TODAS AS COLUNAS UTILIZADAS PELO V5.1 EXISTEM
-- REGRAS: ZERO DDL / ZERO DML / FORMATO TABULAR / SELECT-ONLY
-- ==============================================================================

SELECT 
    ('public.' || req.table_name) AS "Tabela",
    req.column_name AS "Coluna Verificada",
    COALESCE(c.data_type, 'NÃO ENCONTRADA') AS "Tipo de Dado",
    CASE 
        WHEN c.column_name IS NOT NULL THEN 'SIM' 
        ELSE 'NÃO' 
    END AS "Existe?",
    CASE 
        WHEN c.column_name IS NOT NULL THEN 'PRONTO / CONFORME'
        ELSE 'CRIADA AUTOMATICAMENTE NO V5.1'
    END AS "Status para V5.1"
FROM (
    VALUES 
        -- 1. profiles
        ('profiles', 'id', 1),
        ('profiles', 'is_super_admin', 2),

        -- 2. organizations
        ('organizations', 'id', 3),
        ('organizations', 'name', 4),
        ('organizations', 'slug', 5),
        ('organizations', 'phone', 6),
        ('organizations', 'address', 7),
        ('organizations', 'cnpj_cpf', 8),
        ('organizations', 'logo_url', 9),
        ('organizations', 'owner_id', 10),
        ('organizations', 'status', 11),
        ('organizations', 'updated_at', 12),

        -- 3. organization_members
        ('organization_members', 'organization_id', 13),
        ('organization_members', 'user_id', 14),
        ('organization_members', 'role', 15),
        ('organization_members', 'status', 16),

        -- 4. subscriptions
        ('subscriptions', 'organization_id', 17),
        ('subscriptions', 'product_id', 18),
        ('subscriptions', 'status', 19),
        ('subscriptions', 'plan_name', 20),
        ('subscriptions', 'started_at', 21),
        ('subscriptions', 'expires_at', 22),
        ('subscriptions', 'updated_at', 23),

        -- 5. products
        ('products', 'id', 24),
        ('products', 'slug', 25),
        ('products', 'name', 26),
        ('products', 'description', 27),
        ('products', 'category', 28),
        ('products', 'status', 29)
) AS req(table_name, column_name, ord)
LEFT JOIN information_schema.columns c
    ON c.table_schema = 'public' 
   AND c.table_name = req.table_name 
   AND c.column_name = req.column_name
ORDER BY req.ord ASC;
