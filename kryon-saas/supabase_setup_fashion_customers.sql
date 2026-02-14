-- Create Customers Table for Fashion Module
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    city TEXT,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Owners can manage their customers" ON public.customers
    USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
    WITH CHECK (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

-- Policy for reading customers (redundant if the above covers all, but explicit for clarity)
-- The above policy covers SELECT, INSERT, UPDATE, DELETE because no specific command is specified.
