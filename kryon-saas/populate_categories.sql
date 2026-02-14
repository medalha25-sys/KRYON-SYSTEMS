-- Script to populate default fashion categories for the current user's shop

DO $$
DECLARE
    v_shop_id UUID;
BEGIN
    -- Get the shop_id for the current authenticated user
    SELECT id INTO v_shop_id FROM public.shops WHERE owner_id = auth.uid() LIMIT 1;

    IF v_shop_id IS NOT NULL THEN
        -- Insert Categories
        INSERT INTO public.fashion_categories (shop_id, name) VALUES
        (v_shop_id, 'Short'),
        (v_shop_id, 'Saia'),
        (v_shop_id, 'Blusa'),
        (v_shop_id, 'Vestido'),
        (v_shop_id, 'Macacão'),
        (v_shop_id, 'Calça'),
        (v_shop_id, 'Camiseta'),
        (v_shop_id, 'Casaco'),
        (v_shop_id, 'Lingerie'),
        (v_shop_id, 'Moda Praia'),
        (v_shop_id, 'Tênis'),
        (v_shop_id, 'Sandália'),
        (v_shop_id, 'Bota'),
        (v_shop_id, 'Sapato'),
        (v_shop_id, 'Chinelo'),
        (v_shop_id, 'Bolsa'),
        (v_shop_id, 'Cinto'),
        (v_shop_id, 'Acessórios');
    END IF;
END $$;
