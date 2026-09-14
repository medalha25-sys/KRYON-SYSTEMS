-- ==============================================================================
-- KRYON SYSTEMS — AJUSTE DE SCHEMA: COMPATIBILIDADE DE ROLES EM ORGANIZATION_MEMBERS
-- BANCO: Sistemas Kryon (pgpobxvkojawrstadrel.supabase.co)
-- OBJETIVO: ATUALIZAR A CONSTRAINT LEGADA DE 2024 PARA SUPORTAR 'owner' DO V5.1
-- STATUS: PROPOSTA DE MIGRAÇÃO DDL (NÃO EXECUTAR AINDA — AGUARDANDO APROVAÇÃO)
-- ==============================================================================

-- 1. Remoção da constraint restritiva legada ('admin', 'professional', 'secretary')
ALTER TABLE public.organization_members 
    DROP CONSTRAINT IF EXISTS organization_members_role_check;

-- 2. Adição da constraint unificada e compatível com Core Foundation + Módulos
ALTER TABLE public.organization_members 
    ADD CONSTRAINT organization_members_role_check 
    CHECK (role IN ('owner', 'admin', 'member', 'operator', 'viewer', 'professional', 'secretary'));

COMMENT ON CONSTRAINT organization_members_role_check ON public.organization_members IS
'Constraint de validação de papéis compatível com Core Foundation V5.1 e módulos legados.';
