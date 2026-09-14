-- ==============================================================================
-- KRYON SYSTEMS — ETAPA 3: MIGRACÃO PILOTO KRYON LAVA RÁPIDO (VERSÃO 5.1 FINAL)
-- DATA: 03/09/2026
-- MODO: NÃO-DESTRUTIVO / IDEMPOTENTE / PRESERVAÇÃO TOTAL DE TRIGGERS / ZERO-TRUST
-- AJUSTE OFICIAL: TRIAL GRÁTIS DE 30 DIAS (PADRÃO COMERCIAL KRYON SYSTEMS)
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

CREATE UNIQUE INDEX IF NOT EXISTS uq_idx_organizations_slug ON public.organizations(slug) WHERE slug IS NOT NULL;

-- 2. Garantia de constraint UNIQUE em SUBSCRIPTIONS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_subscriptions_org_product'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD CONSTRAINT uq_subscriptions_org_product UNIQUE (organization_id, product_id);
    END IF;
END $$;

-- 3. Tabela de Serviços (Catálogo de preços por organização)
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

-- 7. Compatibilidade de Perfis (Cache legado de leitura)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'ADMIN';

-- ==============================================================================
-- BLOCO B: FUNCTIONS COM HARDENING E CONTROLE DE PRIVILÉGIOS
-- ==============================================================================

-- 1. Ativação de Assinatura com Verificação Estrita de Autorização (Padrão: 30 Dias)
CREATE OR REPLACE FUNCTION public.activate_product_subscription(
    p_organization_id UUID,
    p_product_slug TEXT,
    p_plan_name TEXT DEFAULT 'Plano Trial (30 Dias)',
    p_trial_days INTEGER DEFAULT 30
)
RETURNS UUID AS $$
DECLARE
    v_prod_id UUID;
    v_sub_id UUID;
    v_is_authorized BOOLEAN := false;
BEGIN
    IF auth.role() = 'service_role' THEN
        v_is_authorized := true;
    ELSIF auth.uid() IS NOT NULL THEN
        SELECT true INTO v_is_authorized
        FROM public.organization_members
        WHERE organization_id = p_organization_id 
          AND user_id = auth.uid() 
          AND role IN ('owner', 'admin') 
          AND status = 'active'
        LIMIT 1;

        IF NOT COALESCE(v_is_authorized, false) THEN
            SELECT is_super_admin INTO v_is_authorized 
            FROM public.profiles 
            WHERE id = auth.uid();
        END IF;
    END IF;

    IF NOT COALESCE(v_is_authorized, false) THEN
        RAISE EXCEPTION 'Acesso negado: Usuário não autorizado a ativar assinaturas para esta organização.';
    END IF;

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

REVOKE ALL ON FUNCTION public.activate_product_subscription(UUID, TEXT, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_product_subscription(UUID, TEXT, TEXT, INTEGER) TO authenticated, service_role;

-- 2. Consulta Pública de Serviços por Slug da Organização (Anti-Scraping)
CREATE OR REPLACE FUNCTION public.get_public_organization_services(
    p_slug TEXT
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    vehicle_type TEXT,
    price DECIMAL(10,2),
    duration_minutes INTEGER,
    organization_id UUID,
    organization_name TEXT,
    organization_phone TEXT,
    organization_address TEXT
) AS $$
DECLARE
    v_org RECORD;
BEGIN
    SELECT org.id, org.name, org.phone, org.address 
    INTO v_org
    FROM public.organizations org
    WHERE lower(org.slug) = lower(trim(p_slug)) 
      AND org.status = 'active'
    LIMIT 1;

    IF v_org.id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.vehicle_type,
        s.price,
        s.duration_minutes,
        v_org.id AS organization_id,
        v_org.name AS organization_name,
        v_org.phone AS organization_phone,
        v_org.address AS organization_address
    FROM public.services s
    WHERE s.tenant_id = v_org.id 
      AND s.is_active = true
    ORDER BY s.price ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.get_public_organization_services(TEXT) TO anon, authenticated;

-- 3. Agendamento Público Blindado (Zero Confiança no Cliente / Anti Cross-Tenant)
CREATE OR REPLACE FUNCTION public.create_public_appointment(
    p_slug TEXT,
    p_service_id UUID,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_cpf TEXT DEFAULT NULL,
    p_vehicle_plate TEXT DEFAULT NULL,
    p_scheduled_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_org_id UUID;
    v_service RECORD;
    v_appointment_id UUID;
BEGIN
    SELECT id INTO v_org_id
    FROM public.organizations
    WHERE lower(slug) = lower(trim(p_slug)) AND status = 'active'
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Estabelecimento inválido ou inativo para o link informado.';
    END IF;

    SELECT id, price, name INTO v_service
    FROM public.services
    WHERE id = p_service_id 
      AND tenant_id = v_org_id 
      AND is_active = true
    LIMIT 1;

    IF v_service.id IS NULL THEN
        RAISE EXCEPTION 'Serviço inválido ou não pertencente a este estabelecimento.';
    END IF;

    IF p_customer_name IS NULL OR length(trim(p_customer_name)) = 0 THEN
        RAISE EXCEPTION 'Nome do cliente é obrigatório.';
    END IF;

    IF p_customer_phone IS NULL OR length(trim(p_customer_phone)) < 8 THEN
        RAISE EXCEPTION 'Telefone de contato inválido.';
    END IF;

    INSERT INTO public.appointments (
        tenant_id,
        service_id,
        customer_name,
        customer_phone,
        customer_cpf,
        vehicle_plate,
        scheduled_at,
        status,
        total_price
    ) VALUES (
        v_org_id,
        p_service_id,
        trim(p_customer_name),
        trim(p_customer_phone),
        trim(p_customer_cpf),
        upper(trim(p_vehicle_plate)),
        COALESCE(p_scheduled_at, now()),
        'PENDENTE',
        v_service.price
    )
    RETURNING id INTO v_appointment_id;

    RETURN jsonb_build_object(
        'success', true,
        'appointment_id', v_appointment_id,
        'organization_id', v_org_id,
        'service_name', v_service.name,
        'total_price', v_service.price
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.create_public_appointment(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ) TO anon, authenticated;

-- 4. Onboarding de Proprietário na Organização
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

-- 5. Mutações da VIEW tenants (quando aplicável)
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
-- BLOCO C: TRIGGERS SEGUROS (SEM DROP INCONDICIONAL)
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE event_object_table = 'organizations' AND trigger_name = 'on_organization_owner_created'
    ) THEN
        CREATE TRIGGER on_organization_owner_created
            AFTER INSERT ON public.organizations
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization_owner();
    END IF;
END $$;

-- ==============================================================================
-- BLOCO D: VIEWS / COMPATIBILIDADE COM TENANTS (PRESERVAÇÃO TOTAL)
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

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE event_object_table = 'tenants' AND trigger_name = 'on_tenants_view_mutation'
        ) THEN
            CREATE TRIGGER on_tenants_view_mutation
                INSTEAD OF INSERT OR UPDATE OR DELETE ON public.tenants
                FOR EACH ROW EXECUTE FUNCTION public.handle_tenants_view_mutation();
        END IF;
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
-- BLOCO F: POLICIES DE SEGURANÇA E ISOLAMENTO RIGOROSO
-- ==============================================================================

-- 1. POLICIES: SERVICES (Fechado para membros; anônimos consultam via RPC)
DROP POLICY IF EXISTS "Membros consultam serviços da sua organização" ON public.services;
CREATE POLICY "Membros consultam serviços da sua organização" ON public.services
    FOR SELECT USING (
        tenant_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND status = 'active'
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

-- 3. POLICIES: APPOINTMENTS
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
-- BLOCO H: PRODUTO KRYON LAVA RÁPIDO
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
