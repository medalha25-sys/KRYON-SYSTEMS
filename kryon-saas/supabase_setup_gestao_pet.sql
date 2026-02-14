-- GESTÃO PET TABLES

-- 1. PET OWNERS (Clients/Tutors)
CREATE TABLE IF NOT EXISTS public.pet_owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_slug TEXT DEFAULT 'gestao-pet',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.pet_owners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pet owners - tenant access" ON public.pet_owners;
CREATE POLICY "Pet owners - tenant access"
ON public.pet_owners
FOR ALL
USING (
  tenant_id = get_user_tenant()
  and product_slug = 'gestao-pet'
);


-- 2. PETS
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_slug TEXT DEFAULT 'gestao-pet',
  owner_id UUID REFERENCES public.pet_owners(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT, -- 'Dog', 'Cat', etc.
  breed TEXT,
  birth_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pets - tenant access" ON public.pets;
CREATE POLICY "Pets - tenant access"
ON public.pets
FOR ALL
USING (
  tenant_id = get_user_tenant()
  and product_slug = 'gestao-pet'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON public.pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_tenant_id ON public.pets(tenant_id);


-- 3. PET APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.pet_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_slug TEXT NOT NULL DEFAULT 'gestao-pet',
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  service TEXT NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.pet_appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pet appointments - tenant access" ON public.pet_appointments;
CREATE POLICY "Pet appointments - tenant access"
ON public.pet_appointments
FOR ALL
USING (
  tenant_id = get_user_tenant()
  and product_slug = 'gestao-pet'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pet_appointments_tenant_date ON public.pet_appointments(tenant_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_pet_appointments_pet_id ON public.pet_appointments(pet_id);
