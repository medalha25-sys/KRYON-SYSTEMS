-- EXECUTAR ESTE SQL NO SUPABASE SQL EDITOR

-- 1. Criar tabelas para Lava Rápido
CREATE TABLE IF NOT EXISTS public.lava_rapido_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.shops(id), -- Referência ao shop/tenant logado
    name TEXT NOT NULL,
    description TEXT,
    price_small DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_medium DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_large DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration_minutes INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lava_rapido_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.shops(id),
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    plate TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    color TEXT,
    size TEXT CHECK (size IN ('small', 'medium', 'large')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lava_rapido_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.shops(id),
    vehicle_id UUID NOT NULL REFERENCES public.lava_rapido_vehicles(id),
    service_id UUID NOT NULL REFERENCES public.lava_rapido_services(id),
    status TEXT NOT NULL DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.lava_rapido_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lava_rapido_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lava_rapido_orders ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de RLS
CREATE POLICY "Users can manage their own tenant services" ON public.lava_rapido_services
    FOR ALL USING (tenant_id IN (SELECT id FROM public.shops));

CREATE POLICY "Users can manage their own tenant vehicles" ON public.lava_rapido_vehicles
    FOR ALL USING (tenant_id IN (SELECT id FROM public.shops));

CREATE POLICY "Users can manage their own tenant orders" ON public.lava_rapido_orders
    FOR ALL USING (tenant_id IN (SELECT id FROM public.shops));

-- 4. Tabela de Agendamentos (Fase 2)
CREATE TABLE IF NOT EXISTS public.lava_rapido_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.shops(id),
    service_id UUID NOT NULL REFERENCES public.lava_rapido_services(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    vehicle_plate TEXT,
    vehicle_size TEXT CHECK (vehicle_size IN ('small', 'medium', 'large')),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, canceled
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for bookings
ALTER TABLE public.lava_rapido_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tenant bookings" ON public.lava_rapido_bookings
    FOR ALL USING (tenant_id IN (SELECT id FROM public.shops));

-- Policy for Public Access (Insert only)
-- Note: In a real app, we might need a more complex policy or a service role for public bookings.
-- For now, allowing insert if tenant exists.
CREATE POLICY "Public can create bookings" ON public.lava_rapido_bookings
    FOR INSERT WITH CHECK (true); 

-- 5. Registrar o produto
INSERT INTO public.products (slug, name, description, active)
VALUES ('lava-rapido', 'Lava Rápido', 'Gestão completa para o seu Lava Jato - Ordens de serviço, veículos e serviços.', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
