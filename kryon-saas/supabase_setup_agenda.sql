-- 1. AGENDA CLIENTS
CREATE TABLE IF NOT EXISTS public.agenda_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_slug TEXT DEFAULT 'agenda-facil',
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.agenda_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own clients" ON public.agenda_clients 
  USING (tenant_id = auth.uid());


-- 2. AGENDA SERVICES
CREATE TABLE IF NOT EXISTS public.agenda_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_slug TEXT DEFAULT 'agenda-facil',
  name TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.agenda_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own services" ON public.agenda_services 
  USING (tenant_id = auth.uid());


-- 3. AGENDA PROFESSIONALS
CREATE TABLE IF NOT EXISTS public.agenda_professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_slug TEXT DEFAULT 'agenda-facil',
  name TEXT NOT NULL,
  specialty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.agenda_professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own professionals" ON public.agenda_professionals 
  USING (tenant_id = auth.uid());


-- 4. AGENDA APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.agenda_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_slug TEXT DEFAULT 'agenda-facil',
  client_id UUID REFERENCES public.agenda_clients(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.agenda_services(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.agenda_professionals(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'canceled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.agenda_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own appointments" ON public.agenda_appointments 
  USING (tenant_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agenda_appointments_tenant_date ON public.agenda_appointments(tenant_id, start_time);
