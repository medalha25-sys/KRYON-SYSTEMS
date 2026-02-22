-- FORCE update store_type to allow access to other modules
UPDATE public.shops
SET store_type = 'other' 
WHERE owner_id = (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com');

-- Verify the change
SELECT name, store_type FROM public.shops 
WHERE owner_id = (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com');
