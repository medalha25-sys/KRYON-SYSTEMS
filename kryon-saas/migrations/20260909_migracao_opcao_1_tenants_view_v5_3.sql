-- ==============================================================================
-- KRYON SYSTEMS — DDL DE MIGRAÇÃO CONTROLADA DA OPÇÃO 1 (V5.3 FINAL)
-- BANCO: Sistemas Kryon (pgpobxvkojawrstadrel.supabase.co)
-- DATA: 09/09/2026
-- ESCOPO AUTORIZADO: tenants (BASE TABLE) -> VIEW compatível sobre organizations
-- TRANSAÇÃO: ATÔMICA (BEGIN ... COMMIT / ROLLBACK EM CASO DE ERRO)
-- AUTORIZAÇÃO FORMAL: WESLEY (09/09/2026)
-- ==============================================================================

BEGIN;

-- 1. Remoção de eventual FK legada em profiles apontando para tenants
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_tenant_id_fkey;

-- 2. Renomeação segura da tabela física para backup permanente
ALTER TABLE public.tenants RENAME TO tenants_legacy_backup;

-- 3. Migração do registro do teste real para public.organizations
INSERT INTO public.organizations (
    id, name, slug, phone, address, owner_id, status
)
SELECT 
    id, name, slug, phone, address, owner_id, 'active'
FROM public.tenants_legacy_backup
ON CONFLICT (id) DO NOTHING;

-- 4. Função de mutação com BLINDAGEM ZERO-TRUST (Anti-IDOR e Restrição por Role)
CREATE OR REPLACE FUNCTION public.handle_tenants_view_mutation()
RETURNS TRIGGER AS $$
DECLARE
    v_org_id UUID;
    v_owner_id UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Força o owner_id a ser o usuário autenticado da sessão
        v_owner_id := COALESCE(auth.uid(), NEW.owner_id);
        
        IF v_owner_id IS NULL AND auth.role() != 'service_role' THEN
            RAISE EXCEPTION 'Operação não autorizada: owner_id é obrigatório para cadastrar uma organização.';
        END IF;

        INSERT INTO public.organizations (
            id, name, slug, phone, address, cnpj_cpf, logo_url, owner_id, status
        ) VALUES (
            COALESCE(NEW.id, gen_random_uuid()),
            NEW.name,
            NEW.slug,
            NEW.phone,
            NEW.address,
            COALESCE(NEW.cnpj, NEW.cnpj_cpf),
            NEW.logo_url,
            v_owner_id,
            COALESCE(NEW.status, 'active')
        )
        RETURNING id INTO v_org_id;

        NEW.id := v_org_id;
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Blindagem Estrita: Apenas o dono ou membros com role 'owner' ou 'admin' podem atualizar
        IF auth.role() != 'service_role' THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.organizations org
                WHERE org.id = OLD.id 
                  AND (
                      org.owner_id = auth.uid()
                      OR EXISTS (
                          SELECT 1 FROM public.organization_members mem
                          WHERE mem.organization_id = OLD.id
                            AND mem.user_id = auth.uid()
                            AND mem.role IN ('owner', 'admin')
                            AND mem.status = 'active'
                      )
                  )
            ) THEN
                RAISE EXCEPTION 'Acesso negado: apenas o proprietário ou administrador pode alterar esta organização.';
            END IF;
        END IF;

        UPDATE public.organizations SET
            name = COALESCE(NEW.name, organizations.name),
            slug = COALESCE(NEW.slug, organizations.slug),
            phone = COALESCE(NEW.phone, organizations.phone),
            address = COALESCE(NEW.address, organizations.address),
            cnpj_cpf = COALESCE(NEW.cnpj, NEW.cnpj_cpf, organizations.cnpj_cpf),
            logo_url = COALESCE(NEW.logo_url, organizations.logo_url),
            status = COALESCE(NEW.status, organizations.status),
            updated_at = timezone('utc'::text, now())
        WHERE id = OLD.id;
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        -- Blindagem Estrita: Apenas o proprietário formal pode cancelar a organização
        IF auth.role() != 'service_role' THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.organizations org
                WHERE org.id = OLD.id AND org.owner_id = auth.uid()
            ) THEN
                RAISE EXCEPTION 'Acesso negado: apenas o proprietário pode cancelar a organização.';
            END IF;
        END IF;

        UPDATE public.organizations SET status = 'canceled' WHERE id = OLD.id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 5. Criação da VIEW unificada public.tenants
CREATE OR REPLACE VIEW public.tenants AS
SELECT 
    id,
    name,
    slug,
    phone,
    address,
    legal_name,
    cnpj_cpf AS cnpj,
    cnpj_cpf,
    logo_url,
    owner_id,
    status,
    created_at,
    updated_at
FROM public.organizations;

-- 6. Ativação do Trigger INSTEAD OF na VIEW
DROP TRIGGER IF EXISTS on_tenants_view_mutation ON public.tenants;
CREATE TRIGGER on_tenants_view_mutation
    INSTEAD OF INSERT OR UPDATE OR DELETE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.handle_tenants_view_mutation();

-- 7. Concessão Estrita de Privilégios (Princípio do Menor Privilégio)
REVOKE ALL ON public.tenants FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.tenants TO anon;
GRANT SELECT, INSERT, UPDATE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;

COMMIT;
