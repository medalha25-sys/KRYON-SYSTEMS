-- ==============================================================================
-- KRYON SYSTEMS — ETAPA 3: MIGRACÃO PILOTO KRYON LAVA RÁPIDO (VERSÃO 2 BLINDADA)
-- DATA: 03/09/2026
-- MODO: NÃO-DESTRUTIVO / IDEMPOTENTE / ISOLAMENTO RLS REFORÇADO
-- ==============================================================================

-- ==============================================================================
-- BLOCO A: CRIAÇÃO DE ESTRUTURA (TABELAS E COLUNAS)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Garantia de colunas na tabela central ORGANIZATIONS
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cnpj_cpf TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Índice único seguro para o slug (evita duplicidade de link público)
CREATE UNIQUE INDEX IF NOT EXISTS uq_idx_organizations_slug ON public.organizations(slug) WHERE slug IS NOT NULL;

-- 2. Garantia de unicidade em SUBSCRIPTIONS (organization_id + product_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_subscriptions_org_product'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD CONSTRAINT uq_subscriptions_org_product UNIQUE (organization_id, product_id);
    END IF;
END $$;

-- 3. Tabela de Serviços (Tabela de preços por organização)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    vehicle_type TEXT NOT NULL DEFAULT 'CARRO',
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'CARRO';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 4. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    cpf TEXT,
    vehicle_plate TEXT,
    vehicle_model TEXT,
    notes TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS vehicle_plate TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 5. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_cpf TEXT,
    vehicle_plate TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'PENDENTE',
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS customer_cpf TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS vehicle_plate TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDENTE';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 6. Tabela de Feedbacks
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_phone TEXT,
    comment TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 7. Compatibilidade de Perfis
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'ADMIN';

-- ==============================================================================
-- BLOCO B: FUNCTIONS (PL/PGSQL) COM HARDENING DE SECURITY DEFINER
-- ==============================================================================

-- 1. Função explícita para ativar assinatura de produto (Sem triggers genéricos)
CREATE OR REPLACE FUNCTION public.activate_product_subscription(
    p_organization_id UUID,
    p_product_slug TEXT,
    p_plan_name TEXT DEFAULT 'Plano Trial (7 Dias)',
    p_trial_days INTEGER DEFAULT 7
)
RETURNS UUID AS $$
DECLARE
    v_prod_id UUID;
    v_sub_id UUID;
BEGIN
    SELECT id INTO v_prod_id FROM public.products WHERE slug = p_product_slug LIMIT 1;
    
    IF v_prod_id IS NULL THEN
        RAISE EXCEPTION 'Produto com slug % não encontrado no catálogo central.', p_product_slug;
    END IF;

    INSERT INTO public.subscriptions (
        organization_id, product_id, status, plan_name, started_at, expires_at
    ) VALUES (
        p_organization_id,
        v_prod_id,
        'trial',
        p_plan_name,
        now(),
        now() + (p_trial_days || ' days')::interval
    )
    ON CONFLICT (organization_id, product_id) DO UPDATE SET
        status = 'trial',
        plan_name = EXCLUDED.plan_name,
        expires_at = EXCLUDED.expires_at,
        updated_at = now()
    RETURNING id INTO v_sub_id;

    RETURN v_sub_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. Função de Onboarding do Usuário (Associa apenas como owner em organization_members)
CREATE OR REPLACE FUNCTION public.handle_new_organization_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.owner_id IS NOT NULL THEN
        INSERT INTO public.organization_members (organization_id, user_id, role, status)
        VALUES (NEW.id, NEW.owner_id, 'owner', 'active')
        ON CONFLICT (organization_id, user_id) DO NOTHING;

        UPDATE public.profiles 
        SET tenant_id = NEW.id, role = 'ADMIN' 
        WHERE id = NEW.owner_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 3. Função de mutação para a VIEW tenants (quando aplicável)
CREATE OR REPLACE FUNCTION public.handle_tenants_view_mutation()
RETURNS TRIGGER AS $$
DECLARE
    v_org_id UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.organizations (
            id, name, slug, phone, address, cnpj_cpf, logo_url, owner_id, status
        ) VALUES (
            COALESCE(NEW.id, gen_random_uuid()),
            NEW.name,
            NEW.slug,
            NEW.phone,
            NEW.address,
            COALESCE(NEW.cnpj, NEW.cnpj_cpf),
            NEW.logo_url,
            NEW.owner_id,
            COALESCE(NEW.status, 'active')
        )
        RETURNING id INTO v_org_id;

        -- Ativa a assinatura do produto kryon-lava-rapido sob demanda
        PERFORM public.activate_product_subscription(v_org_id, 'kryon-lava-rapido');

        NEW.id := v_org_id;
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.organizations SET
            name = COALESCE(NEW.name, organizations.name),
            slug = COALESCE(NEW.slug, organizations.slug),
            phone = COALESCE(NEW.phone, organizations.phone),
            address = COALESCE(NEW.address, organizations.address),
            cnpj_cpf = COALESCE(NEW.cnpj, NEW.cnpj_cpf, organizations.cnpj_cpf),
            logo_url = COALESCE(NEW.logo_url, organizations.logo_url),
            owner_id = COALESCE(NEW.owner_id, organizations.owner_id),
            status = COALESCE(NEW.status, organizations.status),
            updated_at = timezone('utc'::text, now())
        WHERE id = OLD.id;
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.organizations SET status = 'canceled' WHERE id = OLD.id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ==============================================================================
-- BLOCO C: TRIGGERS SEGUROS
-- ==============================================================================

DROP TRIGGER IF EXISTS on_organization_owner_created ON public.organizations;
CREATE TRIGGER on_organization_owner_created
    AFTER INSERT ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization_owner();

-- ==============================================================================
-- BLOCO D: VIEWS OU ADAPTAÇÃO DE TENANTS FÍSICA
-- ==============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'tenants' AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    ELSE
        CREATE OR REPLACE VIEW public.tenants AS
        SELECT 
            id,
            name,
            slug,
            phone,
            address,
            legal_name,
            cnpj_cpf AS cnpj,
            cnpj_cpf,
            logo_url,
            owner_id,
            status,
            created_at,
            updated_at
        FROM public.organizations;

        DROP TRIGGER IF EXISTS on_tenants_view_mutation ON public.tenants;
        CREATE TRIGGER on_tenants_view_mutation
            INSTEAD OF INSERT OR UPDATE OR DELETE ON public.tenants
            FOR EACH ROW EXECUTE FUNCTION public.handle_tenants_view_mutation();
    END IF;
END $$;

-- ==============================================================================
-- BLOCO E: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- BLOCO F: POLICIES DE SEGURANÇA BLINDADAS CONTRA ENUMERAÇÃO E INJEÇÃO CRUZADA
-- ==============================================================================

-- 1. POLICIES: SERVICES
DROP POLICY IF EXISTS "Serviços visíveis publicamente apenas de organizações ativas" ON public.services;
CREATE POLICY "Serviços visíveis publicamente apenas de organizações ativas" ON public.services
    FOR SELECT USING (
        tenant_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
        OR (
            is_active = true 
            AND tenant_id IN (SELECT id FROM public.organizations WHERE status = 'active')
        )
    );

DROP POLICY IF EXISTS "Membros gerenciam serviços da sua organização" ON public.services;
CREATE POLICY "Membros gerenciam serviços da sua organização" ON public.services
    FOR ALL USING (
        tenant_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    ) WITH CHECK (
        tenant_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- 2. POLICIES: CUSTOMERS
DROP POLICY IF EXISTS "Membros gerenciam clientes da sua organização" ON public.customers;
CREATE POLICY "Membros gerenciam clientes da sua organização" ON public.customers
    FOR ALL USING (
        tenant_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    ) WITH CHECK (
        tenant_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- 3. POLICIES: APPOINTMENTS (Anti Cross-Tenant Injection)
DROP POLICY IF EXISTS "Agendamento público com validação estrita de integridade" ON public.appointments;
CREATE POLICY "Agendamento público com validação estrita de integridade" ON public.appointments
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT id FROM public.organizations WHERE status = 'active')
        AND service_id IN (
            SELECT id FROM public.services 
            WHERE services.tenant_id = appointments.tenant_id 
              AND services.is_active = true
        )
        AND customer_name IS NOT NULL AND length(trim(customer_name)) > 0
        AND customer_phone IS NOT NULL AND length(trim(customer_phone)) >= 8
    );

DROP POLICY IF EXISTS "Membros gerenciam agendamentos da sua organização" ON public.appointments;
CREATE POLICY "Membros gerenciam agendamentos da sua organização" ON public.appointments
    FOR ALL USING (
        tenant_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    ) WITH CHECK (
        tenant_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- 4. POLICIES: FEEDBACKS
DROP POLICY IF EXISTS "Clientes anônimos enviam feedbacks válidos" ON public.feedbacks;
CREATE POLICY "Clientes anônimos enviam feedbacks válidos" ON public.feedbacks
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT id FROM public.organizations WHERE status = 'active')
        AND comment IS NOT NULL AND length(trim(comment)) > 0
        AND rating >= 1 AND rating <= 5
    );

DROP POLICY IF EXISTS "Membros visualizam feedbacks da sua organização" ON public.feedbacks;
CREATE POLICY "Membros visualizam feedbacks da sua organização" ON public.feedbacks
    FOR SELECT USING (
        tenant_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- ==============================================================================
-- BLOCO G: ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_services_tenant ON public.services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON public.appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_tenant ON public.feedbacks(tenant_id);

-- ==============================================================================
-- BLOCO H: CARGA E ATUALIZAÇÃO DO PRODUTO KRYON LAVA RÁPIDO
-- ==============================================================================

INSERT INTO public.products (slug, name, description, category, status)
VALUES (
    'kryon-lava-rapido',
    'Kryon Lava Rápido',
    'Gestão completa para lava-rápidos e estética automotiva.',
    'LAVA RÁPIDO',
    'active'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    status = EXCLUDED.status;
