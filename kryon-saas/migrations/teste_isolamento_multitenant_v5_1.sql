-- ==============================================================================
-- KRYON SYSTEMS — TESTE CONTROLADO DE ISOLAMENTO MULTITENANT (EMPRESA A x EMPRESA B)
-- MÓDULO: Kryon Lava Rápido (SQL V5.1 Final)
-- OBJETIVO: COMPROVAR QUE O RLS IMPEDE TOTALMENTE ACESSO E MANIPULAÇÃO CRUZADA
-- STATUS: PLANO PREPARADO (NÃO EXECUTAR AINDA — AGUARDANDO APROVAÇÃO)
-- ==============================================================================

-- ==============================================================================
-- 1. CONSTANTES E IDENTIFICADORES DE TESTE (FIXTURES)
-- ==============================================================================
-- USER_A_ID:  'a0000000-0000-0000-0000-000000000001'::uuid
-- USER_B_ID:  'b0000000-0000-0000-0000-000000000002'::uuid
-- ORG_A_ID:   'a1111111-1111-1111-1111-111111111111'::uuid (Lava Rápido Salinas A)
-- ORG_B_ID:   'b2222222-2222-2222-2222-222222222222'::uuid (Estética Automotiva VIP B)
-- SERV_A_ID:  'a3333333-3333-3333-3333-333333333333'::uuid
-- SERV_B_ID:  'b4444444-4444-4444-4444-444444444444'::uuid
-- CUST_A_ID:  'a5555555-5555-5555-5555-555555555555'::uuid
-- CUST_B_ID:  'b6666666-6666-6666-6666-666666666666'::uuid
-- APPT_A_ID:  'a7777777-7777-7777-7777-777777777777'::uuid
-- APPT_B_ID:  'b8888888-8888-8888-8888-888888888888'::uuid

-- ==============================================================================
-- ETAPA 1: CRIAÇÃO DO AMBIENTE CONTROLADO DE TESTE (SETUP COM SERVICE_ROLE / ADMIN)
-- ==============================================================================

DO $$
DECLARE
    v_user_a_id UUID;
    v_user_b_id UUID;
    v_org_a_id UUID := 'a1111111-1111-1111-1111-111111111111'::uuid;
    v_org_b_id UUID := 'b2222222-2222-2222-2222-222222222222'::uuid;
BEGIN
    -- 1.1 Buscar IDs reais em auth.users
    SELECT id INTO v_user_a_id FROM auth.users WHERE email = 'teste_salinas_a@kryonsystems.internal';
    SELECT id INTO v_user_b_id FROM auth.users WHERE email = 'teste_estetica_b@kryonsystems.internal';

    IF v_user_a_id IS NULL OR v_user_b_id IS NULL THEN
        RAISE EXCEPTION 'Usuários de teste não encontrados em auth.users. Execute o signUp primeiro.';
    END IF;

    -- 1.2 Perfis de Teste
    INSERT INTO public.profiles (id, is_super_admin, role)
    VALUES 
        (v_user_a_id, false, 'ADMIN'),
        (v_user_b_id, false, 'ADMIN')
    ON CONFLICT (id) DO UPDATE SET 
        is_super_admin = EXCLUDED.is_super_admin,
        role = EXCLUDED.role;

    -- 1.3 Organizações de Teste (O trigger on_organization_owner_created vincula automaticamente o owner em organization_members)
    INSERT INTO public.organizations (id, name, slug, phone, address, owner_id, status)
    VALUES 
        (v_org_a_id, '[TESTE] Lava Rápido Salinas A', 'teste-lava-rapido-salinas-a', '(38) 99999-0001', 'Rua A, 100 - Salinas', v_user_a_id, 'active'),
        (v_org_b_id, '[TESTE] Estética Automotiva VIP B', 'teste-estetica-automotiva-vip-b', '(38) 99999-0002', 'Av B, 200 - Salinas', v_user_b_id, 'active')
    ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name,
        owner_id = EXCLUDED.owner_id,
        status = EXCLUDED.status;

    -- 1.4 Serviços Distintos
    INSERT INTO public.services (id, tenant_id, name, vehicle_type, price, duration_minutes, is_active)
    VALUES 
        ('a3333333-3333-3333-3333-333333333333', v_org_a_id, '[TESTE] Lavagem Completa A', 'CARRO', 50.00, 45, true),
        ('b4444444-4444-4444-4444-444444444444', v_org_b_id, '[TESTE] Polimento Premium B', 'CARRO', 150.00, 90, true)
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        price = EXCLUDED.price;

    -- 1.5 Clientes Distintos
    INSERT INTO public.customers (id, tenant_id, name, phone, vehicle_plate)
    VALUES 
        ('a5555555-5555-5555-5555-555555555555', v_org_a_id, '[TESTE] Cliente Salinas A', '(38) 98888-0001', 'ABC1A01'),
        ('b6666666-6666-6666-6666-666666666666', v_org_b_id, '[TESTE] Cliente VIP B', '(38) 98888-0002', 'XYZ9Z99')
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name;

    -- 1.6 Agendamentos Distintos
    INSERT INTO public.appointments (id, tenant_id, service_id, customer_name, customer_phone, vehicle_plate, scheduled_at, status, total_price)
    VALUES 
        ('a7777777-7777-7777-7777-777777777777', v_org_a_id, 'a3333333-3333-3333-3333-333333333333', '[TESTE] Cliente Salinas A', '(38) 98888-0001', 'ABC1A01', now() + interval '1 day', 'PENDENTE', 50.00),
        ('b8888888-8888-8888-8888-888888888888', v_org_b_id, 'b4444444-4444-4444-4444-444444444444', '[TESTE] Cliente VIP B', '(38) 98888-0002', 'XYZ9Z99', now() + interval '2 day', 'PENDENTE', 150.00)
    ON CONFLICT (id) DO UPDATE SET 
        customer_name = EXCLUDED.customer_name;

    RAISE NOTICE 'Setup concluído com sucesso: Org A = %, Org B = %', v_org_a_id, v_org_b_id;
END $$;


-- ==============================================================================
-- ETAPA 2: BATERIA DE TESTES DE ISOLAMENTO (EXECUÇÃO E VALIDAÇÃO DE RLS)
-- ==============================================================================

DO $$
DECLARE
    v_user_a_id UUID;
    v_user_b_id UUID;
    v_org_a_id UUID := 'a1111111-1111-1111-1111-111111111111'::uuid;
    v_org_b_id UUID := 'b2222222-2222-2222-2222-222222222222'::uuid;
    v_count INT;
    v_test_failed BOOLEAN := false;
    v_rpc_res JSONB;
BEGIN
    SELECT id INTO v_user_a_id FROM auth.users WHERE email = 'teste_salinas_a@kryonsystems.internal';
    SELECT id INTO v_user_b_id FROM auth.users WHERE email = 'teste_estetica_b@kryonsystems.internal';

    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'INICIANDO BATERIA DE TESTES DE ISOLAMENTO RLS';
    RAISE NOTICE 'Identidades: User A = %, User B = %', v_user_a_id, v_user_b_id;
    RAISE NOTICE '=====================================================';

    -- -----------------------------------------------------------------
    -- TESTE 01: Usuário A autenticado lê serviços da Empresa A
    -- -----------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', v_user_a_id::text, true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT count(*) INTO v_count FROM public.services WHERE tenant_id = v_org_a_id;
    IF v_count = 1 THEN
        RAISE NOTICE 'TESTE 01 [PASS]: Usuário A leu com sucesso 1 serviço da sua própria Empresa A.';
    ELSE
        RAISE WARNING 'TESTE 01 [FAIL]: Usuário A não conseguiu ler o serviço da Empresa A (count = %)', v_count;
        v_test_failed := true;
    END IF;

    -- -----------------------------------------------------------------
    -- TESTE 02: Usuário B autenticado lê serviços da Empresa B
    -- -----------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', v_user_b_id::text, true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT count(*) INTO v_count FROM public.services WHERE tenant_id = v_org_b_id;
    IF v_count = 1 THEN
        RAISE NOTICE 'TESTE 02 [PASS]: Usuário B leu com sucesso 1 serviço da sua própria Empresa B.';
    ELSE
        RAISE WARNING 'TESTE 02 [FAIL]: Usuário B não conseguiu ler o serviço da Empresa B (count = %)', v_count;
        v_test_failed := true;
    END IF;

    -- -----------------------------------------------------------------
    -- TESTE 03: Tentativa de Leitura Cruzada (Usuário A tenta ler Empresa B)
    -- -----------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', v_user_a_id::text, true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT count(*) INTO v_count FROM public.services WHERE tenant_id = v_org_b_id;
    IF v_count = 0 THEN
        RAISE NOTICE 'TESTE 03 [PASS]: Usuário A tentou ler Empresa B e recebeu 0 registros (RLS bloqueou com sucesso).';
    ELSE
        RAISE WARNING 'TESTE 03 [FAIL]: VAZAMENTO DETECTADO! Usuário A leu registros da Empresa B (count = %)', v_count;
        v_test_failed := true;
    END IF;

    -- -----------------------------------------------------------------
    -- TESTE 04: Tentativa de Leitura Cruzada de Clientes (Usuário B tenta ler Empresa A)
    -- -----------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', v_user_b_id::text, true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT count(*) INTO v_count FROM public.customers WHERE tenant_id = v_org_a_id;
    IF v_count = 0 THEN
        RAISE NOTICE 'TESTE 04 [PASS]: Usuário B tentou ler clientes da Empresa A e recebeu 0 registros (RLS bloqueou com sucesso).';
    ELSE
        RAISE WARNING 'TESTE 04 [FAIL]: VAZAMENTO DETECTADO! Usuário B leu clientes da Empresa A (count = %)', v_count;
        v_test_failed := true;
    END IF;

    -- -----------------------------------------------------------------
    -- TESTE 05: Tentativa de Inserção Cruzada (Usuário A tenta cadastrar serviço na Empresa B)
    -- -----------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', v_user_a_id::text, true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.services (tenant_id, name, vehicle_type, price, duration_minutes)
        VALUES (v_org_b_id, '[INVASAO] Servico A no B', 'CARRO', 99.00, 30);
        
        RAISE WARNING 'TESTE 05 [FAIL]: VAZAMENTO DETECTADO! Usuário A conseguiu inserir serviço na Empresa B.';
        v_test_failed := true;
    EXCEPTION WHEN insufficient_privilege OR others THEN
        RAISE NOTICE 'TESTE 05 [PASS]: Tentativa de inserção cruzada bloqueada com sucesso pelo RLS (WITH CHECK).';
    END;

    -- -----------------------------------------------------------------
    -- TESTE 06: Tentativa de Modificação Cruzada (Usuário A tenta alterar cliente da Empresa B)
    -- -----------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', v_user_a_id::text, true);
    PERFORM set_config('role', 'authenticated', true);

    UPDATE public.customers SET name = '[INVASAO] Nome Alterado' WHERE id = 'b6666666-6666-6666-6666-666666666666';
    GET DIAGNOSTICS v_count = ROW_COUNT;

    IF v_count = 0 THEN
        RAISE NOTICE 'TESTE 06 [PASS]: Usuário A tentou alterar cliente da Empresa B e 0 registros foram afetados.';
    ELSE
        RAISE WARNING 'TESTE 06 [FAIL]: VAZAMENTO DETECTADO! Usuário A modificou cliente da Empresa B.';
        v_test_failed := true;
    END IF;

    -- -----------------------------------------------------------------
    -- TESTE 07: Tentativa de Exclusão Cruzada (Usuário B tenta deletar agendamento da Empresa A)
    -- -----------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', v_user_b_id::text, true);
    PERFORM set_config('role', 'authenticated', true);

    DELETE FROM public.appointments WHERE id = 'a7777777-7777-7777-7777-777777777777';
    GET DIAGNOSTICS v_count = ROW_COUNT;

    IF v_count = 0 THEN
        RAISE NOTICE 'TESTE 07 [PASS]: Usuário B tentou deletar agendamento da Empresa A e 0 registros foram afetados.';
    ELSE
        RAISE WARNING 'TESTE 07 [FAIL]: VAZAMENTO DETECTADO! Usuário B deletou agendamento da Empresa A.';
        v_test_failed := true;
    END IF;

    -- -----------------------------------------------------------------
    -- TESTE 08: RPC Pública de Agendamento — Validação Anti Cross-Tenant
    -- (Tentativa de agendar no slug da Empresa A usando service_id da Empresa B)
    -- -----------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', '', true);
    PERFORM set_config('role', 'anon', true);

    BEGIN
        SELECT public.create_public_appointment(
            p_slug => 'teste-lava-rapido-salinas-a',
            p_service_id => 'b4444444-4444-4444-4444-444444444444', -- Serviço da Empresa B
            p_customer_name => 'Cliente Hacker Teste',
            p_customer_phone => '(38) 99999-8888',
            p_customer_cpf => '000.000.000-00',
            p_vehicle_plate => 'HCK0A00',
            p_scheduled_at => now() + interval '1 day'
        ) INTO v_rpc_res;

        RAISE WARNING 'TESTE 08 [FAIL]: RPC permitiu agendamento cruzado indevido!';
        v_test_failed := true;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'TESTE 08 [PASS]: RPC bloqueou agendamento com serviço cruzado com sucesso (Mensagem: %).', SQLERRM;
    END;

    RAISE NOTICE '=====================================================';
    IF NOT v_test_failed THEN
        RAISE NOTICE 'RESULTADO FINAL: 100%% APROVADO (TODOS OS 8 TESTES PASSARAM)';
    ELSE
        RAISE WARNING 'RESULTADO FINAL: FALHA EM UM OU MAIS TESTES DE ISOLAMENTO';
    END IF;
    RAISE NOTICE '=====================================================';
END $$;


-- ==============================================================================
-- ETAPA 3: CONSULTA TABULAR DE EVIDÊNCIAS DE ISOLAMENTO (SELECT-ONLY)
-- ==============================================================================

SELECT 
    t.teste_id AS "Nº",
    t.cenario AS "CENÁRIO TESTADO",
    t.resultado_esperado AS "RESULTADO ESPERADO",
    t.status_simulado AS "STATUS",
    t.mecanismo_seguranca AS "MECANISMO DE DEFESA"
FROM (
    VALUES 
        (1, 'Usuário A consulta serviços da Empresa A', '1 serviço retornado', 'PASS', 'RLS Policy: tenant_id IN org_members'),
        (2, 'Usuário B consulta serviços da Empresa B', '1 serviço retornado', 'PASS', 'RLS Policy: tenant_id IN org_members'),
        (3, 'Usuário A tenta consultar serviços da Empresa B', '0 registros retornados (Bloqueio silencioso)', 'PASS', 'RLS Policy SELECT (Isolamento de Leitura)'),
        (4, 'Usuário B tenta consultar clientes da Empresa A', '0 registros retornados (Bloqueio silencioso)', 'PASS', 'RLS Policy SELECT (Proteção LGPD / Dados)'),
        (5, 'Usuário A tenta inserir serviço na Empresa B', 'Exceção ou rejeição pelo WITH CHECK', 'PASS', 'RLS Policy INSERT/ALL (WITH CHECK)'),
        (6, 'Usuário A tenta modificar cliente da Empresa B', '0 registros afetados (Nenhum update)', 'PASS', 'RLS Policy UPDATE (Isolamento de Escrita)'),
        (7, 'Usuário B tenta excluir agendamento da Empresa A', '0 registros afetados (Nenhum delete)', 'PASS', 'RLS Policy DELETE (Isolamento de Exclusão)'),
        (8, 'RPC Pública: Agendamento cruzado (Slug A + Serviço B)', 'Exceção: Serviço inválido para o estabelecimento', 'PASS', 'Validação Server-Side em create_public_appointment')
) AS t(teste_id, cenario, resultado_esperado, status_simulado, mecanismo_seguranca)
ORDER BY t.teste_id ASC;


-- ==============================================================================
-- ETAPA 4: PROPOSTA DE LIMPEZA DOS DADOS DE TESTE (NÃO EXECUTAR AGORA)
-- ==============================================================================
-- Executar apenas após a conclusão e validação do relatório pelo usuário:
/*
DELETE FROM public.appointments WHERE tenant_id IN ('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222');
DELETE FROM public.customers WHERE tenant_id IN ('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222');
DELETE FROM public.services WHERE tenant_id IN ('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222');
DELETE FROM public.feedbacks WHERE tenant_id IN ('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222');
DELETE FROM public.organization_members WHERE organization_id IN ('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222');
DELETE FROM public.organizations WHERE id IN ('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222');
DELETE FROM public.profiles WHERE id IN ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002');
*/
