-- ==============================================================================
-- KRYON SYSTEMS — ETAPA 3: PRÉ-CHECK DIAGNÓSTICO EXAUSTIVO (DRY-RUN / SOMENTE LEITURA)
-- DATA: 03/09/2026
-- ==============================================================================

DO $$
DECLARE
    v_tenants_exists BOOLEAN := false;
    v_tenants_type TEXT := 'INEXISTENTE';
    v_tenants_count INT := 0;
    v_orgs_count INT := 0;
    v_products_count INT := 0;
    v_services_count INT := 0;
    v_customers_count INT := 0;
    v_appointments_count INT := 0;
    v_feedbacks_count INT := 0;
    v_profiles_count INT := 0;
    v_auth_users_count INT := 0;

    v_distinct_tenants_services INT := 0;
    v_distinct_tenants_customers INT := 0;
    v_distinct_tenants_appointments INT := 0;

    v_orphaned_services INT := 0;
    v_orphaned_customers INT := 0;
    v_orphaned_appointments INT := 0;
    v_orgs_without_members INT := 0;
BEGIN
    RAISE NOTICE '======================================================================';
    RAISE NOTICE '   INICIANDO PRÉ-CHECK DIAGNÓSTICO EXAUSTIVO — KRYON SYSTEMS          ';
    RAISE NOTICE '======================================================================';

    -- 1. Inspeciona TENANTS
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') INTO v_tenants_exists;
    IF v_tenants_exists THEN
        SELECT table_type INTO v_tenants_type FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants';
        EXECUTE 'SELECT count(*) FROM public.tenants' INTO v_tenants_count;
        RAISE NOTICE '[TENANTS] Existe como % com % registros.', v_tenants_type, v_tenants_count;
    ELSE
        RAISE NOTICE '[TENANTS] Não existe no schema public.';
    END IF;

    -- 2. Inspeciona ORGANIZATIONS
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
        SELECT count(*) INTO v_orgs_count FROM public.organizations;
        RAISE NOTICE '[ORGANIZATIONS] Existe com % empresas cadastradas.', v_orgs_count;
    ELSE
        RAISE NOTICE '[ORGANIZATIONS] Tabela não encontrada.';
    END IF;

    -- 3. Inspeciona PRODUCTS
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        SELECT count(*) INTO v_products_count FROM public.products;
        RAISE NOTICE '[PRODUCTS] Existe com % produtos cadastrados no catálogo.', v_products_count;
    END IF;

    -- 4. Inspeciona PROFILES e AUTH.USERS
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        SELECT count(*) INTO v_profiles_count FROM public.profiles;
        RAISE NOTICE '[PROFILES] Existe com % perfis cadastrados.', v_profiles_count;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        SELECT count(*) INTO v_auth_users_count FROM auth.users;
        RAISE NOTICE '[AUTH.USERS] % usuários autenticados no Supabase Auth.', v_auth_users_count;
    END IF;

    -- 5. Inspeciona Tabelas de Negócio e Tenant_IDs Distintos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services') THEN
        EXECUTE 'SELECT count(*), count(DISTINCT tenant_id) FROM public.services' INTO v_services_count, v_distinct_tenants_services;
        RAISE NOTICE '[SERVICES] % serviços cadastrados distribuídos em % tenant_ids distintos.', v_services_count, v_distinct_tenants_services;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customers') THEN
        EXECUTE 'SELECT count(*), count(DISTINCT tenant_id) FROM public.customers' INTO v_customers_count, v_distinct_tenants_customers;
        RAISE NOTICE '[CUSTOMERS] % clientes cadastrados distribuídos em % tenant_ids distintos.', v_customers_count, v_distinct_tenants_customers;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
        EXECUTE 'SELECT count(*), count(DISTINCT tenant_id) FROM public.appointments' INTO v_appointments_count, v_distinct_tenants_appointments;
        RAISE NOTICE '[APPOINTMENTS] % agendamentos registrados distribuídos em % tenant_ids distintos.', v_appointments_count, v_distinct_tenants_appointments;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedbacks') THEN
        EXECUTE 'SELECT count(*) FROM public.feedbacks' INTO v_feedbacks_count;
        RAISE NOTICE '[FEEDBACKS] % avaliações registradas.', v_feedbacks_count;
    END IF;

    -- 6. Detecção de Registros Órfãos
    RAISE NOTICE '----------------------------------------------------------------------';
    RAISE NOTICE 'VERIFICAÇÃO DE REGISTROS ÓRFÃOS:';

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
        SELECT count(*) INTO v_orphaned_services 
        FROM public.services s
        LEFT JOIN public.organizations o ON s.tenant_id = o.id
        WHERE o.id IS NULL AND s.tenant_id IS NOT NULL;
        RAISE NOTICE '• Serviços órfãos (sem organization): %', v_orphaned_services;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customers') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
        SELECT count(*) INTO v_orphaned_customers 
        FROM public.customers c
        LEFT JOIN public.organizations o ON c.tenant_id = o.id
        WHERE o.id IS NULL AND c.tenant_id IS NOT NULL;
        RAISE NOTICE '• Clientes órfãos (sem organization): %', v_orphaned_customers;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
        SELECT count(*) INTO v_orphaned_appointments 
        FROM public.appointments a
        LEFT JOIN public.organizations o ON a.tenant_id = o.id
        WHERE o.id IS NULL AND a.tenant_id IS NOT NULL;
        RAISE NOTICE '• Agendamentos órfãos (sem organization): %', v_orphaned_appointments;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_members') THEN
        SELECT count(*) INTO v_orgs_without_members
        FROM public.organizations o
        LEFT JOIN public.organization_members om ON o.id = om.organization_id
        WHERE om.id IS NULL;
        RAISE NOTICE '• Organizações sem nenhum membro vinculado: %', v_orgs_without_members;
    END IF;

    RAISE NOTICE '======================================================================';
    RAISE NOTICE 'PRÉ-CHECK DIAGNÓSTICO CONCLUÍDO.';
    RAISE NOTICE '======================================================================';
END $$;
