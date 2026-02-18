-- Migration: Fix Sales Schema & RLS
-- Date: 2026-02-16

-- 1. Ensure 'sales' table exists
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE, -- Assuming 'shops' is the tenant table in this context, based on usage in SalesTerminal
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    payment_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Ensure 'sale_items' table exists
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id), -- Or fashion_products? Based on SalesTerminal it seems generic or fashion_products. Let's use flexible reference or just UUID for now if product table varies. 
    -- Actually looking at SalesTerminal, it fetches from 'fashion_products'. But there might be 'products' too. 
    -- Let's stick to simple UUID for product_id for now to avoid FK issues if table name varies, OR check if fashion_products exists.
    -- Better: Don't enforce FK on product_id strictly if we aren't sure of the table name universally, but for data integrity it's good. 
    -- For now, let's assume loose coupling for product_id or just UUID.
    product_id UUID, 
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Drop existing to ensure clean state)

DROP POLICY IF EXISTS "Enable read access for users based on shop_id" ON public.sales;
DROP POLICY IF EXISTS "Enable insert access for users based on shop_id" ON public.sales;
DROP POLICY IF EXISTS "Enable read access for users based on shop_id" ON public.sale_items;
DROP POLICY IF EXISTS "Enable insert access for users based on shop_id" ON public.sale_items;

-- Policy for SALES
CREATE POLICY "Enable read access for users based on shop_id" ON public.sales
FOR SELECT USING (
    auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE shop_id = public.sales.shop_id
    )
);

CREATE POLICY "Enable insert access for users based on shop_id" ON public.sales
FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE shop_id = public.sales.shop_id
    )
);

-- Policy for SALE_ITEMS
CREATE POLICY "Enable read access for users based on shop_id" ON public.sale_items
FOR SELECT USING (
    auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE shop_id = public.sale_items.shop_id
    )
);

CREATE POLICY "Enable insert access for users based on shop_id" ON public.sale_items
FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE shop_id = public.sale_items.shop_id
    )
);

-- Grant permissions just in case
GRANT ALL ON public.sales TO authenticated;
GRANT ALL ON public.sale_items TO authenticated;
GRANT ALL ON public.sales TO service_role;
GRANT ALL ON public.sale_items TO service_role;
