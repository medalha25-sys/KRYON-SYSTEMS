-- 1. SETUP PROFILES (Linked to User)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  role TEXT DEFAULT 'admin', -- 'admin', 'operator', etc.
  shop_id UUID, -- Will reference shops table
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. SETUP SHOPS (Tenants)
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE, -- e.g. 'loja-do-joao'
  plan TEXT DEFAULT 'trial',
  trial_ate TIMESTAMPTZ DEFAULT (NOW() + interval '15 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own shop" ON public.shops FOR SELECT USING (auth.uid() = owner_id);

-- 3. INVENTORY ITEMS (Renamed from products to avoid conflict)
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  image_url TEXT,
  barcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shop owners view inventory" ON public.inventory_items FOR SELECT USING (
  shop_id IN (SELECT shop_id FROM public.profiles WHERE id = auth.uid()) 
  OR 
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);

-- 4. SERVICE ORDERS
CREATE TABLE IF NOT EXISTS public.service_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  device_brand TEXT,
  device_model TEXT,
  status TEXT DEFAULT 'analysis' CHECK (status IN ('analysis', 'waiting', 'ready', 'delayed', 'delivered')),
  description TEXT,
  cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shop owners view OS" ON public.service_orders FOR SELECT USING (
  shop_id IN (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
  OR
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);

-- 5. FUNCTION TO HANDLE NEW USER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_shop_id UUID;
BEGIN
  -- Create a default shop for the user
  INSERT INTO public.shops (owner_id, name)
  VALUES (new.id, 'Minha Loja')
  RETURNING id INTO new_shop_id;

  -- Create profile linked to shop
  INSERT INTO public.profiles (id, name, shop_id, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new_shop_id, 'admin');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. SEED DATA (For visualization)
-- Insert a dummy shop and items only if you are testing manually
