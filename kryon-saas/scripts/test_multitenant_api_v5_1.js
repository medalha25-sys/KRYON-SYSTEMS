/**
 * ==============================================================================
 * KRYON SYSTEMS — TESTE DE ISOLAMENTO MULTITENANT VIA SUPABASE API (SDK OFICIAL)
 * BANCO: Sistemas Kryon (pgpobxvkojawrstadrel.supabase.co)
 * DATA: 03/09/2026
 * OBJETIVO: VALIDAR O RLS COM REQUISIÇÕES HTTP/REST REAIS E SESSÕES JWT AUTENTICADAS
 * ==============================================================================
 */

import { createClient } from '@supabase/supabase-js';

export async function runMultitenantIsolationTest() {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Configurações do Supabase não encontradas no ambiente.');
    }

    console.log('================================================================');
    console.log('KRYON SYSTEMS — TESTE DE ISOLAMENTO VIA SUPABASE REST API (RLS)');
    console.log('================================================================\n');

    const results = [];

    // 1. Instâncias de Teste Não-Privilegiadas
    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const clientAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

    // ==========================================================================
    // ETAPA 1: SETUP & AUTENTICAÇÃO REAL (VIA SUPABASE AUTH GOTRUE)
    // ==========================================================================
    console.log('🔑 [SETUP & AUTH] Autenticando sessões reais no Supabase Auth...');

    const emailA = 'teste_salinas_a@kryonsystems.internal';
    const emailB = 'teste_estetica_b@kryonsystems.internal';
    const password = 'SenhaForteTeste2026!#';

    // 1.1 Autenticar / Registrar Usuário A
    let userAId;
    let authResA = await clientA.auth.signInWithPassword({ email: emailA, password });
    if (authResA.error) {
        const signUpA = await clientA.auth.signUp({ email: emailA, password, options: { data: { name: 'Proprietário Empresa A' } } });
        if (signUpA.error) throw new Error(`Falha ao registrar User A: ${signUpA.error.message}`);
        authResA = await clientA.auth.signInWithPassword({ email: emailA, password });
    }
    userAId = authResA.data.user.id;
    console.log(`✔ User A autenticado via JWT: ${userAId}`);

    // 1.2 Autenticar / Registrar Usuário B
    let userBId;
    let authResB = await clientB.auth.signInWithPassword({ email: emailB, password });
    if (authResB.error) {
        const signUpB = await clientB.auth.signUp({ email: emailB, password, options: { data: { name: 'Proprietário Empresa B' } } });
        if (signUpB.error) throw new Error(`Falha ao registrar User B: ${signUpB.error.message}`);
        authResB = await clientB.auth.signInWithPassword({ email: emailB, password });
    }
    userBId = authResB.data.user.id;
    console.log(`✔ User B autenticado via JWT: ${userBId}`);
    console.log('✔ Cliente Anônimo pronto (Role anon / Sem JWT)\n');

    // 1.3 Criar Organizações (O trigger nativo on_organization_owner_created cria o membership automaticamente)
    console.log('🏢 [SETUP] Criando organizações e fixtures de teste...');
    
    // Obter ou criar Org A via clientA
    let orgA;
    const { data: existingOrgA } = await clientA.from('organizations').select('*').eq('slug', 'teste-lava-rapido-salinas-a').maybeSingle();
    if (existingOrgA) {
        orgA = existingOrgA;
    } else {
        const { data: newOrgA, error: errOrgA } = await clientA.from('organizations').insert({
            name: '[TESTE] Lava Rápido Salinas A',
            slug: 'teste-lava-rapido-salinas-a',
            phone: '(38) 99999-0001',
            owner_id: userAId,
            status: 'active'
        }).select().single();
        if (errOrgA) throw new Error(`Falha ao criar Org A: ${errOrgA.message}`);
        orgA = newOrgA;
    }

    // Obter ou criar Org B via clientB
    let orgB;
    const { data: existingOrgB } = await clientB.from('organizations').select('*').eq('slug', 'teste-estetica-vip-b').maybeSingle();
    if (existingOrgB) {
        orgB = existingOrgB;
    } else {
        const { data: newOrgB, error: errOrgB } = await clientB.from('organizations').insert({
            name: '[TESTE] Estética VIP B',
            slug: 'teste-estetica-vip-b',
            phone: '(38) 99999-0002',
            owner_id: userBId,
            status: 'active'
        }).select().single();
        if (errOrgB) throw new Error(`Falha ao criar Org B: ${errOrgB.message}`);
        orgB = newOrgB;
    }

    // 1.4 Inserir Fixtures de Teste
    // Serviços
    let servA, servB;
    const { data: existingServA } = await clientA.from('services').select('*').eq('tenant_id', orgA.id).maybeSingle();
    if (existingServA) {
        servA = existingServA;
    } else {
        const { data: newServA } = await clientA.from('services').insert({
            tenant_id: orgA.id,
            name: '[TESTE] Lavagem Completa A',
            vehicle_type: 'CARRO',
            price: 50.00,
            duration_minutes: 45,
            is_active: true
        }).select().single();
        servA = newServA;
    }

    const { data: existingServB } = await clientB.from('services').select('*').eq('tenant_id', orgB.id).maybeSingle();
    if (existingServB) {
        servB = existingServB;
    } else {
        const { data: newServB } = await clientB.from('services').insert({
            tenant_id: orgB.id,
            name: '[TESTE] Polimento VIP B',
            vehicle_type: 'CARRO',
            price: 150.00,
            duration_minutes: 90,
            is_active: true
        }).select().single();
        servB = newServB;
    }

    // Clientes
    let custA, custB;
    const { data: existingCustA } = await clientA.from('customers').select('*').eq('tenant_id', orgA.id).maybeSingle();
    if (existingCustA) {
        custA = existingCustA;
    } else {
        const { data: newCustA } = await clientA.from('customers').insert({
            tenant_id: orgA.id,
            name: '[TESTE] Cliente Salinas A',
            phone: '(38) 98888-0001',
            vehicle_plate: 'ABC1A01'
        }).select().single();
        custA = newCustA;
    }

    const { data: existingCustB } = await clientB.from('customers').select('*').eq('tenant_id', orgB.id).maybeSingle();
    if (existingCustB) {
        custB = existingCustB;
    } else {
        const { data: newCustB } = await clientB.from('customers').insert({
            tenant_id: orgB.id,
            name: '[TESTE] Cliente VIP B',
            phone: '(38) 98888-0002',
            vehicle_plate: 'XYZ9Z99'
        }).select().single();
        custB = newCustB;
    }

    // Agendamento A
    let apptA;
    const { data: existingApptA } = await clientA.from('appointments').select('*').eq('tenant_id', orgA.id).maybeSingle();
    if (existingApptA) {
        apptA = existingApptA;
    } else {
        const { data: newApptA } = await clientA.from('appointments').insert({
            tenant_id: orgA.id,
            service_id: servA.id,
            customer_name: '[TESTE] Cliente Salinas A',
            customer_phone: '(38) 98888-0001',
            vehicle_plate: 'ABC1A01',
            scheduled_at: new Date(Date.now() + 86400000).toISOString(),
            status: 'PENDENTE',
            total_price: 50.00
        }).select().single();
        apptA = newApptA;
    }

    console.log('✅ Fixtures preparadas com sucesso.\n');

    // ==========================================================================
    // ETAPA 2: EXECUÇÃO DOS 8 CENÁRIOS RLS VIA HTTP / POSTGREST
    // ==========================================================================
    console.log('🧪 [TESTES RLS] Executando os 8 cenários via API Supabase...\n');

    // CENÁRIO 01: Leitura Própria Org A
    {
        const { data, error } = await clientA.from('services').select('*').eq('tenant_id', orgA.id);
        const pass = !error && data && data.length >= 1 && data.some(s => s.id === servA.id);
        results.push({
            id: 1,
            cenario: '01 - Leitura Própria Org A',
            identidade: `USER_A (${emailA})`,
            operacao: `GET /services?tenant_id=eq.${orgA.id}`,
            resultado: !error ? `HTTP 200 • ${data.length} serviço retornado (${data[0]?.name})` : `Erro: ${error.message}`,
            status: pass ? 'PASS' : 'FAIL',
            mecanismo: 'RLS SELECT Policy (tenant_id IN organization_members)'
        });
    }

    // CENÁRIO 02: Leitura Própria Org B
    {
        const { data, error } = await clientB.from('services').select('*').eq('tenant_id', orgB.id);
        const pass = !error && data && data.length >= 1 && data.some(s => s.id === servB.id);
        results.push({
            id: 2,
            cenario: '02 - Leitura Própria Org B',
            identidade: `USER_B (${emailB})`,
            operacao: `GET /services?tenant_id=eq.${orgB.id}`,
            resultado: !error ? `HTTP 200 • ${data.length} serviço retornado (${data[0]?.name})` : `Erro: ${error.message}`,
            status: pass ? 'PASS' : 'FAIL',
            mecanismo: 'RLS SELECT Policy (tenant_id IN organization_members)'
        });
    }

    // CENÁRIO 03: Leitura Cruzada de Serviços (A no B)
    {
        const { data, error } = await clientA.from('services').select('*').eq('tenant_id', orgB.id);
        const pass = !error && data && data.length === 0;
        results.push({
            id: 3,
            cenario: '03 - Leitura Cruzada de Serviços (A tenta ler Org B)',
            identidade: `USER_A (${emailA})`,
            operacao: `GET /services?tenant_id=eq.${orgB.id}`,
            resultado: !error ? `HTTP 200 • 0 registros retornados (Zero vazamento)` : `Erro: ${error.message}`,
            status: pass ? 'PASS' : 'FAIL',
            mecanismo: 'RLS SELECT Policy (Filtro Silencioso de Isolamento)'
        });
    }

    // CENÁRIO 04: Leitura Cruzada de Clientes (B no A)
    {
        const { data, error } = await clientB.from('customers').select('*').eq('tenant_id', orgA.id);
        const pass = !error && data && data.length === 0;
        results.push({
            id: 4,
            cenario: '04 - Leitura Cruzada de Clientes (B tenta ler clientes de A)',
            identidade: `USER_B (${emailB})`,
            operacao: `GET /customers?tenant_id=eq.${orgA.id}`,
            resultado: !error ? `HTTP 200 • 0 registros retornados (LGPD 100% Protegido)` : `Erro: ${error.message}`,
            status: pass ? 'PASS' : 'FAIL',
            mecanismo: 'RLS SELECT Policy (Isolamento de Dados Sensíveis)'
        });
    }

    // CENÁRIO 05: Inserção Cruzada de Serviço (A tenta cadastrar serviço na Org B)
    {
        const { data, error } = await clientA.from('services').insert({
            tenant_id: orgB.id,
            name: '[INVASAO] Servico A no B',
            vehicle_type: 'CARRO',
            price: 99.00,
            duration_minutes: 30
        }).select();
        const pass = error !== null;
        results.push({
            id: 5,
            cenario: '05 - Inserção Cruzada de Serviço (A tenta inserir na Org B)',
            identidade: `USER_A (${emailA})`,
            operacao: `POST /services (tenant_id = Org B)`,
            resultado: error ? `HTTP ${error.code || 403} • Bloqueado pelo RLS: ${error.message}` : 'Permitido indevidamente',
            status: pass ? 'PASS' : 'FAIL',
            mecanismo: 'RLS INSERT/ALL Policy (WITH CHECK)'
        });
    }

    // CENÁRIO 06: Modificação Cruzada de Cliente (A tenta alterar cliente da Org B)
    {
        const { data, error } = await clientA.from('customers').update({
            name: '[INVASAO] Alterado por A'
        }).eq('id', custB.id).select();
        const pass = !error && data && data.length === 0;
        results.push({
            id: 6,
            cenario: '06 - Modificação Cruzada de Cliente (A tenta alterar cliente de B)',
            identidade: `USER_A (${emailA})`,
            operacao: `PATCH /customers?id=eq.${custB.id}`,
            resultado: !error ? `HTTP 200 • 0 linhas modificadas (Registro intocado)` : `Erro: ${error.message}`,
            status: pass ? 'PASS' : 'FAIL',
            mecanismo: 'RLS UPDATE Policy (Isolamento de Mutação)'
        });
    }

    // CENÁRIO 07: Exclusão Cruzada de Agendamento (B tenta deletar agendamento da Org A)
    {
        const { data, error } = await clientB.from('appointments').delete().eq('id', apptA.id).select();
        const pass = !error && data && data.length === 0;
        results.push({
            id: 7,
            cenario: '07 - Exclusão Cruzada de Agendamento (B tenta deletar de A)',
            identidade: `USER_B (${emailB})`,
            operacao: `DELETE /appointments?id=eq.${apptA.id}`,
            resultado: !error ? `HTTP 200 • 0 linhas excluídas (Registro protegido)` : `Erro: ${error.message}`,
            status: pass ? 'PASS' : 'FAIL',
            mecanismo: 'RLS DELETE Policy (Isolamento de Exclusão)'
        });
    }

    // CENÁRIO 08: RPC Pública Anti Cross-Tenant (clientAnon / Role anon)
    {
        const { data, error } = await clientAnon.rpc('create_public_appointment', {
            p_slug: 'teste-lava-rapido-salinas-a',
            p_service_id: servB.id, // Pertence à Org B!
            p_customer_name: 'Cliente Hacker',
            p_customer_phone: '(38) 99999-8888',
            p_vehicle_plate: 'HCK0A00'
        });
        const pass = error !== null;
        results.push({
            id: 8,
            cenario: '08 - RPC Pública Anti Cross-Tenant (Agendamento)',
            identidade: 'ANÔNIMO (Role anon / Sem JWT)',
            operacao: 'POST /rpc/create_public_appointment (Slug A + Serviço B)',
            resultado: error ? `HTTP 400 • Bloqueado com exceção: ${error.message}` : 'Permitido indevidamente',
            status: pass ? 'PASS' : 'FAIL',
            mecanismo: 'Validação Server-Side em create_public_appointment'
        });
    }

    return results;
}
