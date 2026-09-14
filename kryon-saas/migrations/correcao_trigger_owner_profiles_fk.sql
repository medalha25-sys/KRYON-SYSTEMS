-- ==============================================================================
-- KRYON SYSTEMS — DDL: CORREÇÃO DA FK LEGADA E ALINHAMENTO DO TRIGGER DE OWNER
-- BANCO: Sistemas Kryon (pgpobxvkojawrstadrel.supabase.co)
-- OBJETIVO: ELIMINAR A FK PROFILES_TENANT_ID_FKEY E VINCULAR EXCLUSIVAMENTE PROFILES.ORGANIZATION_ID
-- STATUS: PROPOSTA DE DDL (NÃO EXECUTAR AINDA — AGUARDANDO REVISÃO FINAL)
-- ==============================================================================

-- 1. Remoção da Foreign Key legada e obsoleta em profiles apontando para tenants
ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_tenant_id_fkey;

-- 2. Recriação da função de trigger handle_new_organization_owner()
-- Alinhada 100% ao modelo organizations + organization_members + profiles.organization_id
CREATE OR REPLACE FUNCTION public.handle_new_organization_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.owner_id IS NOT NULL THEN
        -- 2.1 Garante o vínculo formal do proprietário em organization_members com papel 'owner'
        INSERT INTO public.organization_members (organization_id, user_id, role, status)
        VALUES (NEW.id, NEW.owner_id, 'owner', 'active')
        ON CONFLICT (organization_id, user_id) DO NOTHING;

        -- 2.2 Atualiza profiles.organization_id e role 'ADMIN' (sem escrever na coluna legada tenant_id)
        UPDATE public.profiles 
        SET organization_id = NEW.id,
            role = 'ADMIN' 
        WHERE id = NEW.owner_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.handle_new_organization_owner() IS 
'Vincula automaticamente o proprietário a organization_members (role owner) e profiles.organization_id (role ADMIN).';
