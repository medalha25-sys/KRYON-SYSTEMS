-- 1. Create Fashion Categories Table
CREATE TABLE IF NOT EXISTS public.fashion_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for categories
ALTER TABLE public.fashion_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their categories" ON public.fashion_categories
    USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
    WITH CHECK (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

-- 2. Add Columns to Fashion Products
ALTER TABLE public.fashion_products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.fashion_products ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.fashion_products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.fashion_categories(id) ON DELETE SET NULL;
ALTER TABLE public.fashion_products ADD COLUMN IF NOT EXISTS sku TEXT; -- Stock Keeping Unit / Custom Code

-- 3. Enhance Size/Color (Already exist as text, but JSONB might be better for variants later. Keeping as text for now as per request)

-- 4. Update Policies if needed (Existing ones cover new columns automatically)
