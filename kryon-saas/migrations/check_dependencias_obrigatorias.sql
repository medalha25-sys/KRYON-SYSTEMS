-- ==============================================================================
-- KRYON SYSTEMS — VERIFICAÇÃO DE DEPENDÊNCIAS OBRIGATÓRIAS (SOMENTE LEITURA)
-- DATA: 03/09/2026
-- OBJETIVO: VERIFICAR SE AS 5 TABELAS CENTRAIS EXISTEM E SEUS TIPOS
-- REGRAS: ZERO DDL / ZERO DML / SELECT-ONLY / FORMATO TABULAR
-- ==============================================================================

SELECT 
    ('public.' || req.tbl) AS "Tabela / Entidade",
    CASE 
        WHEN t.table_name IS NOT NULL THEN 'SIM' 
        ELSE 'NÃO' 
    END AS "Existe?",
    COALESCE(t.table_type, 'INEXISTENTE') AS "Tipo da Tabela",
    COALESCE(col.col_count::text, '0') AS "Total de Colunas",
    CASE 
        WHEN to_regclass('public.' || req.tbl) IS NOT NULL THEN
            COALESCE((xpath('/row/count/text()', query_to_xml('SELECT count(*) FROM public.' || quote_ident(req.tbl), false, false, '')))[1]::text, '0')
        ELSE 'Tabela inexistente'
    END AS "Total de Registros",
    CASE 
        WHEN t.table_name IS NOT NULL THEN 'PRONTO / DEPENDÊNCIA ATENDIDA'
        ELSE 'PENDENTE'
    END AS "Status para V5.1"
FROM (
    VALUES 
        ('organizations', 1),
        ('organization_members', 2),
        ('profiles', 3),
        ('products', 4),
        ('subscriptions', 5)
) AS req(tbl, ord)
LEFT JOIN information_schema.tables t 
    ON t.table_schema = 'public' AND t.table_name = req.tbl
LEFT JOIN (
    SELECT table_name, count(*) AS col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    GROUP BY table_name
) col ON col.table_name = req.tbl
ORDER BY req.ord ASC;
