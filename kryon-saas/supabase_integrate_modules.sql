-- INTEGRATE CONCRETE ERP AS SAAS MODULE
-- Adds module-based activation per organization

-- 1. Add modules column with default
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='modules') THEN
        ALTER TABLE organizations ADD COLUMN modules JSONB DEFAULT '{"concrete_erp": false}'::jsonb;
    END IF;
END $$;

-- 2. Update existing orgs to have the default structure if null
UPDATE organizations SET modules = '{"concrete_erp": false}'::jsonb WHERE modules IS NULL;

-- 3. Enable Concrete ERP for the test organization
UPDATE organizations 
SET modules = jsonb_set(modules, '{concrete_erp}', 'true')
WHERE slug = 'concrete-erp-main';

-- 4. Audit Log for Module Change
-- (Assuming public.super_admin_logs exists from previous steps)
INSERT INTO public.super_admin_logs (admin_id, action, target_type, target_id, details)
SELECT 
    id, 
    'enable_module', 
    'organization', 
    (SELECT id FROM organizations WHERE slug = 'concrete-erp-main'), 
    '{"module": "concrete_erp", "status": true}'
FROM profiles 
WHERE is_super_admin = TRUE 
LIMIT 1;

RAISE NOTICE 'Concrete ERP module integrated and enabled for Concrete ERP Brasil.';
