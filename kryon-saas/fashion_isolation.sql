-- 1. Add store_type to shops
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS store_type text DEFAULT 'other';
ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS check_store_type;
ALTER TABLE public.shops ADD CONSTRAINT check_store_type CHECK (store_type IN ('fashion_store_ai', 'mobile_store_ai', 'other'));

-- 2. Create Fashion Products Table
CREATE TABLE IF NOT EXISTS public.fashion_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    cost_price NUMERIC(10,2),
    size TEXT, -- S, M, L, XL, etc.
    color TEXT,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    category TEXT,
    barcode TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Fashion Sales Table
CREATE TABLE IF NOT EXISTS public.fashion_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID, -- Can be linked to fashion_customers later
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT, -- 'pix', 'credit', 'debit', 'cash'
    items JSONB, -- Stores array of sold items with details at time of sale
    status TEXT DEFAULT 'completed', -- 'completed', 'pending', 'canceled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Fashion Customers Table
CREATE TABLE IF NOT EXISTS public.fashion_customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    preferences TEXT, -- AI preferences summary
    measurements JSONB, -- { waist, bust, hips, etc }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE public.fashion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_customers ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (Simple ownership check)
-- Products
CREATE POLICY "Owners can view their fashion products" ON public.fashion_products FOR SELECT USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Owners can insert their fashion products" ON public.fashion_products FOR INSERT WITH CHECK (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Owners can update their fashion products" ON public.fashion_products FOR UPDATE USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Owners can delete their fashion products" ON public.fashion_products FOR DELETE USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);

-- Sales
CREATE POLICY "Owners can view their fashion sales" ON public.fashion_sales FOR SELECT USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Owners can insert their fashion sales" ON public.fashion_sales FOR INSERT WITH CHECK (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Owners can update their fashion sales" ON public.fashion_sales FOR UPDATE USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);

-- Customers
CREATE POLICY "Owners can view their fashion customers" ON public.fashion_customers FOR SELECT USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Owners can insert their fashion customers" ON public.fashion_customers FOR INSERT WITH CHECK (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Owners can update their fashion customers" ON public.fashion_customers FOR UPDATE USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);

-- 7. Update existing shops that might be fashion stores (Optional / Manual step usually)
-- Example: UPDATE public.shops SET store_type = 'fashion_store_ai' WHERE id IN (SELECT shop_id FROM subscriptions WHERE product_slug = 'fashion-manager');
