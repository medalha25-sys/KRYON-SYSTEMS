-- ==============================================================================
-- ETAPA 1: FUNDAÇÃO CENTRAL DA INFRAESTRUTURA KRYON SYSTEMS (MULTI-TENANT & MULTI-PRODUTO)
-- DATA: 03/09/2026
-- MODO: NÃO-DESTRUTIVO (IF NOT EXISTS / ON CONFLICT DO UPDATE)
-- ==============================================================================

-- Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABELA CENTRAL DE PERFIS (PROFILES)
-- Vinculada diretamente ao auth.users do Supabase
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para criar perfil automaticamente no SignUp do Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, phone)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, profiles.name);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. TABELA DE ORGANIZAÇÕES (EMPRESAS / CLIENTES KRYON)
-- Suporte a multi-tenancy corporativo e individual
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    legal_name TEXT,
    cnpj_cpf TEXT,
    email TEXT,
    phone TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    logo_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'canceled')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. TABELA DE MEMBROS DA ORGANIZAÇÃO (MEMBERSHIP & ROLES)
-- Relaciona usuários às organizações com permissões granulares
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'operator', 'viewer')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 4. CATÁLOGO CENTRAL DE PRODUTOS KRYON (MULTI-PRODUTO)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'beta', 'archived')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. TABELA DE ASSINATURAS POR PRODUTO E ORGANIZAÇÃO
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'canceled', 'unpaid')),
    plan_name TEXT DEFAULT 'Plano Mensal',
    started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, product_id)
);

-- ------------------------------------------------------------------------------
-- 6. POPULAÇÃO DO CATÁLOGO OFICIAL COM OS 10 PRODUTOS KRYON
-- ------------------------------------------------------------------------------
INSERT INTO public.products (slug, name, description, category, status)
VALUES
    ('kryon-utilidades', 'Kryon Utilidades', 'Gestão para Lojas de Utilidades Domésticas', 'LOJA DE UTILIDADES', 'active'),
    ('kryon-agenda', 'Kryon Agenda', 'Agendamento Online para o seu Negócio', 'AGENDAMENTO ONLINE', 'active'),
    ('kryon-pet', 'Kryon Pet', 'Gestão Completa para Pet Shops', 'PET SHOP', 'active'),
    ('kryon-celular', 'Kryon Celular', 'Gestão para Lojas e Assistências de Celulares', 'LOJA DE CELULARES', 'active'),
    ('kryon-moda', 'Kryon Moda', 'Gestão para Lojas de Roupas e Calçados', 'LOJA DE ROUPAS', 'active'),
    ('kryon-fotos-studio-pro', 'Kryon Fotos — Studio Pro', 'Galeria Profissional para Fotógrafos', 'FOTÓGRAFOS', 'active'),
    ('kryon-lava-rapido', 'Kryon Lava Rápido', 'Gestão para Lava-Rápidos', 'LAVA RÁPIDO', 'active'),
    ('kryon-decor', 'Kryon Decor', 'Gestão para Lojas de Decoração', 'LOJA DE DECORAÇÃO', 'active'),
    ('kryon-auto', 'Kryon Auto', 'Gestão Completa para Oficinas Mecânicas', 'OFICINA MECÂNICA', 'active'),
    ('kryon-juridico', 'Kryon Jurídico', 'Gestão para Escritórios de Advocacia', 'ADVOGADOS', 'active')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    status = EXCLUDED.status,
    updated_at = timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 7. CRIAÇÃO DE ÍNDICES PARA ALTA PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_product_id ON public.subscriptions(product_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- ------------------------------------------------------------------------------
-- 8. SEGURANÇA E ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- POLICIES: PROFILES
DROP POLICY IF EXISTS "Usuários podem ver o próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver o próprio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar o próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar o próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- POLICIES: PRODUCTS (Leitura Pública do Catálogo de Produtos)
DROP POLICY IF EXISTS "Produtos visíveis publicamente" ON public.products;
CREATE POLICY "Produtos visíveis publicamente" ON public.products
    FOR SELECT USING (true);

-- POLICIES: ORGANIZATIONS (Apenas membros podem acessar)
DROP POLICY IF EXISTS "Membros podem ver suas organizações" ON public.organizations;
CREATE POLICY "Membros podem ver suas organizações" ON public.organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
        OR owner_id = auth.uid()
    );

DROP POLICY IF EXISTS "Owners e admins podem atualizar sua organização" ON public.organizations;
CREATE POLICY "Owners e admins podem atualizar sua organização" ON public.organizations
    FOR UPDATE USING (
        id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
        )
        OR owner_id = auth.uid()
    );

-- POLICIES: ORGANIZATION_MEMBERS
DROP POLICY IF EXISTS "Membros podem ver outros membros da mesma organização" ON public.organization_members;
CREATE POLICY "Membros podem ver outros membros da mesma organização" ON public.organization_members
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- POLICIES: SUBSCRIPTIONS
DROP POLICY IF EXISTS "Membros podem ver assinaturas da sua organização" ON public.subscriptions;
CREATE POLICY "Membros podem ver assinaturas da sua organização" ON public.subscriptions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- ==============================================================================
-- FIM DA ETAPA 1: FUNDAÇÃO CENTRAL PREPARADA COM SUCESSO!
-- ==============================================================================
