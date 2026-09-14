-- ==============================================================================
-- KRYON SYSTEMS — HARDENING RLS V5.1 (VERSÃO FINAL CONSOLIDADA E AUDITADA)
-- BANCO: Sistemas Kryon (pgpobxvkojawrstadrel.supabase.co)
-- MÓDULO: Kryon Lava Rápido & Fundação Central Multi-Tenant
-- OBJETIVO: ELIMINAR VULNERABILIDADES DE ACESSO CRUZADO E AUTO-RECURSÃO RLS
-- STATUS: PROPOSTA FINAL DE HARDENING (AGUARDANDO REVISÃO — NÃO EXECUTAR AINDA)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. FUNÇÃO AUXILIAR BOOLEANA CENTRAL COM HARDENING TOTAL
-- ==============================================================================
-- Executa com SECURITY DEFINER para checar pertencimento de tenant sem disparar recursão RLS
CREATE OR REPLACE FUNCTION public.is_user_member_of_organization(target_organization_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.organization_members
        WHERE organization_id = target_organization_id
          AND user_id = auth.uid()
          AND status = 'active'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- 1.1 Controle Estrito de Privilégios (Privacidade e Anti-Enumeração)
REVOKE ALL ON FUNCTION public.is_user_member_of_organization(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_user_member_of_organization(UUID) TO authenticated;

COMMENT ON FUNCTION public.is_user_member_of_organization(UUID) IS 
'Função SECURITY DEFINER para validação booleana de isolamento multi-tenant sem auto-recursão RLS.';


-- ==============================================================================
-- 2. TABELA: public.organization_members (Eliminação de Recursão)
-- ==============================================================================
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros podem ver outros membros da mesma organização" ON public.organization_members;
DROP POLICY IF EXISTS "Membros visualizam membros da sua organização" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view own membership" ON public.organization_members;

CREATE POLICY "Membros visualizam membros da sua organização" ON public.organization_members
    FOR SELECT USING (
        user_id = auth.uid() 
        OR public.is_user_member_of_organization(organization_id)
    );


-- ==============================================================================
-- 3. TABELA: public.organizations (Isolamento de Tenants Centrais)
-- ==============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros podem ver suas organizações" ON public.organizations;
DROP POLICY IF EXISTS "Owners e admins podem atualizar sua organização" ON public.organizations;
DROP POLICY IF EXISTS "Users can view own organizations" ON public.organizations;

CREATE POLICY "Membros podem ver suas organizações" ON public.organizations
    FOR SELECT USING (
        owner_id = auth.uid() 
        OR public.is_user_member_of_organization(id)
    );

CREATE POLICY "Owners e admins podem atualizar sua organização" ON public.organizations
    FOR UPDATE USING (
        owner_id = auth.uid() 
        OR public.is_user_member_of_organization(id)
    );


-- ==============================================================================
-- 4. TABELA: public.subscriptions (Isolamento de Assinaturas)
-- ==============================================================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros podem ver assinaturas da sua organização" ON public.subscriptions;
DROP POLICY IF EXISTS "Org members view subscriptions" ON public.subscriptions;

CREATE POLICY "Membros podem ver assinaturas da sua organização" ON public.subscriptions
    FOR SELECT USING (
        public.is_user_member_of_organization(organization_id)
    );


-- ==============================================================================
-- 5. TABELA: public.services (Isolamento Hermético de Serviços)
-- ==============================================================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Expurgar todas as policies legadas (incluindo leitura pública aberta)
DROP POLICY IF EXISTS "Serviços visíveis publicamente apenas de organizações ativas" ON public.services;
DROP POLICY IF EXISTS "Membros consultam serviços da sua organização" ON public.services;
DROP POLICY IF EXISTS "Membros gerenciam serviços da sua organização" ON public.services;
DROP POLICY IF EXISTS "Users manage own services" ON public.services;

-- 5.1 SELECT fechado para membros autenticados (Anônimos usam RPC)
CREATE POLICY "Membros consultam serviços da sua organização" ON public.services
    FOR SELECT USING (
        public.is_user_member_of_organization(tenant_id)
    );

-- 5.2 INSERT/UPDATE/DELETE com USING e WITH CHECK rigorosos
CREATE POLICY "Membros gerenciam serviços da sua organização" ON public.services
    FOR ALL USING (
        public.is_user_member_of_organization(tenant_id)
    ) WITH CHECK (
        public.is_user_member_of_organization(tenant_id)
    );


-- ==============================================================================
-- 6. TABELA: public.customers (Isolamento Hermético de Clientes)
-- ==============================================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Expurgar todas as policies legadas identificadas na auditoria
DROP POLICY IF EXISTS "Gerenciamento de clientes pelo tenant" ON public.customers;
DROP POLICY IF EXISTS "Membros gerenciam clientes da sua organização" ON public.customers;
DROP POLICY IF EXISTS "Owners can manage their customers" ON public.customers;

-- 6.1 Política unificada FOR ALL com USING e WITH CHECK rigorosos
CREATE POLICY "Membros gerenciam clientes da sua organização" ON public.customers
    FOR ALL USING (
        public.is_user_member_of_organization(tenant_id)
    ) WITH CHECK (
        public.is_user_member_of_organization(tenant_id)
    );


-- ==============================================================================
-- 7. TABELA: public.appointments (Isolamento Hermético de Agendamentos)
-- ==============================================================================
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Expurgar policies legadas permissivas (que permitiam delete cruzado)
DROP POLICY IF EXISTS "Agendamento público com validação estrita de integridade" ON public.appointments;
DROP POLICY IF EXISTS "Membros gerenciam agendamentos da sua organização" ON public.appointments;
DROP POLICY IF EXISTS "Users manage own appointments" ON public.appointments;

-- 7.1 Gestão restrita para membros (Anônimos inserem via RPC create_public_appointment)
CREATE POLICY "Membros gerenciam agendamentos da sua organização" ON public.appointments
    FOR ALL USING (
        public.is_user_member_of_organization(tenant_id)
    ) WITH CHECK (
        public.is_user_member_of_organization(tenant_id)
    );


-- ==============================================================================
-- 8. TABELA: public.feedbacks (Isolamento de Feedbacks)
-- ==============================================================================
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros visualizam feedbacks da sua organização" ON public.feedbacks;

CREATE POLICY "Membros visualizam feedbacks da sua organização" ON public.feedbacks
    FOR SELECT USING (
        public.is_user_member_of_organization(tenant_id)
    );

COMMIT;
