-- consolidated_lava_rapido_fix.sql
-- 1. Create or Update Product
INSERT INTO public.products (slug, name, description, active, price, features)
VALUES ('lava-rapido', 'Lava Rápido', 'Gestão completa para o seu Lava Jato - Ordens de serviço, veículos e agendamentos.', true, 87.00, '{"Agendamento Online", "Controle de Lavagens", "Fidelidade", "Financeiro"}')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name, 
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    features = EXCLUDED.features;

-- 2. Ensure supporting tables exist
CREATE TABLE IF NOT EXISTS public.lava_rapido_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.shops(id),
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
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS Configuration (Cleaning first to avoid "already exists" errors)
ALTER TABLE public.lava_rapido_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lava_rapido_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lava_rapido_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lava_rapido_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own tenant services" ON public.lava_rapido_services;
CREATE POLICY "Users can manage their own tenant services" ON public.lava_rapido_services
    FOR ALL USING (tenant_id IN (SELECT id FROM public.shops));

DROP POLICY IF EXISTS "Users can manage their own tenant vehicles" ON public.lava_rapido_vehicles;
CREATE POLICY "Users can manage their own tenant vehicles" ON public.lava_rapido_vehicles
    FOR ALL USING (tenant_id IN (SELECT id FROM public.shops));

DROP POLICY IF EXISTS "Users can manage their own tenant orders" ON public.lava_rapido_orders;
CREATE POLICY "Users can manage their own tenant orders" ON public.lava_rapido_orders
    FOR ALL USING (tenant_id IN (SELECT id FROM public.shops));

DROP POLICY IF EXISTS "Users can manage their own tenant bookings" ON public.lava_rapido_bookings;
CREATE POLICY "Users can manage their own tenant bookings" ON public.lava_rapido_bookings
    FOR ALL USING (tenant_id IN (SELECT id FROM public.shops));

DROP POLICY IF EXISTS "Public can create bookings" ON public.lava_rapido_bookings;
CREATE POLICY "Public can create bookings" ON public.lava_rapido_bookings
    FOR INSERT WITH CHECK (true);

-- 4. Create Active Subscription for User
DO $$
DECLARE
    v_user_id UUID;
    v_org_id UUID;
    v_product_id UUID;
BEGIN
    -- Get User
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'medalha25@gmail.com';
    
    IF v_user_id IS NOT NULL THEN
        -- Get Organization
        SELECT organization_id INTO v_org_id FROM public.profiles WHERE id = v_user_id;
        
        -- Get Product
        SELECT id INTO v_product_id FROM public.products WHERE slug = 'lava-rapido' LIMIT 1;
        
        IF v_org_id IS NOT NULL AND v_product_id IS NOT NULL THEN
            -- Insert Subscription (Only if it doesn't exist for this product/org)
            IF NOT EXISTS (
                SELECT 1 FROM public.subscriptions 
                WHERE organization_id = v_org_id AND product_id = v_product_id
            ) THEN
                INSERT INTO public.subscriptions (
                    organization_id, product_id, product_slug, status, current_period_end
                ) VALUES (
                    v_org_id, v_product_id, 'lava-rapido', 'active', now() + interval '1 year'
                );
            ELSE
                UPDATE public.subscriptions 
                SET status = 'active', 
                    current_period_end = now() + interval '1 year'
                WHERE organization_id = v_org_id AND product_id = v_product_id;
            END IF;
        END IF;
    END IF;
END $$;
