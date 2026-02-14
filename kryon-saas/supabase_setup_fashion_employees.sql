-- Create Fashion Employees Table
CREATE TABLE IF NOT EXISTS public.fashion_employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT, -- Optional, or used for login ID
    role TEXT NOT NULL CHECK (role IN ('admin', 'gerente', 'vendedor')),
    password TEXT, -- Simple password/pin for internal auth simulation
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.fashion_employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Owners can manage their employees" ON public.fashion_employees
    USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
    WITH CHECK (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));
