/**
 * ==============================================================================
 * KRYON SYSTEMS — EXECUÇÃO REAL DO TESTE DE ISOLAMENTO VIA SUPABASE REST API
 * BANCO: Sistemas Kryon (pgpobxvkojawrstadrel.supabase.co)
 * DATA: 03/09/2026
 * ARQUITETURA: 100% PostgREST / HTTP com Bearer JWT Real (Zero service_role nos testes)
 * VALIDAÇÃO: Rigorosa, Dinâmica, com Contraprovas e Proteção Anti Falso-Positivo
 * ==============================================================================
 */

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// 1. Carregar variáveis de ambiente de forma segura
function loadEnv() {
    const envPath = 'F:\\DOCUMENTOS\\kryon systems landing page\\kryon-erp\\.env.local';
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        for (const line of envContent.split('\n')) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx !== -1) {
                    const key = trimmed.slice(0, eqIdx).trim();
                    let val = trimmed.slice(eqIdx + 1).trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    process.env[key] = val;
                }
            }
        }
    }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Configurações do Supabase não encontradas no ambiente.');
    process.exit(1);
}

// 2. Constantes das Fixtures de Teste
const ORG_A_ID = 'a1111111-1111-1111-1111-111111111111';
const ORG_B_ID = 'b2222222-2222-2222-2222-222222222222';
const SERV_A_ID = 'a3333333-3333-3333-3333-333333333333';
const SERV_B_ID = 'b4444444-4444-4444-4444-444444444444';
const CUST_A_ID = 'a5555555-5555-5555-5555-555555555555';
const CUST_B_ID = 'b6666666-6666-6666-6666-666666666666';
const APPT_A_ID = 'a7777777-7777-7777-7777-777777777777';
const APPT_B_ID = 'b8888888-8888-8888-8888-888888888888';

const EMAIL_A = 'teste_salinas_a@kryonsystems.internal';
const EMAIL_B = 'teste_estetica_b@kryonsystems.internal';
const PASSWORD = 'SenhaForteTeste2026!#';

export async function runRealApiIsolationTests() {
    console.log('======================================================================');
    console.log('KRYON SYSTEMS — EXECUÇÃO REAL DOS 8 TESTES RLS VIA REST API (POSTGREST)');
    console.log('======================================================================\n');

    // 3. Instanciação dos 3 Clientes Isolados
    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const clientAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

    console.log('🔑 [ETAPA DE AUTENTICAÇÃO REAL]');
    
    // Autenticação Real de USER_A (Obtém Bearer JWT via GoTrue)
    const authA = await clientA.auth.signInWithPassword({ email: EMAIL_A, password: PASSWORD });
    if (authA.error) throw new Error(`Falha na autenticação de USER_A: ${authA.error.message}`);
    const userA_id = authA.data.user.id;
    console.log(`✔ clientA autenticado via signInWithPassword (User ID: ${userA_id})`);

    // Autenticação Real de USER_B (Obtém Bearer JWT via GoTrue)
    const authB = await clientB.auth.signInWithPassword({ email: EMAIL_B, password: PASSWORD });
    if (authB.error) throw new Error(`Falha na autenticação de USER_B: ${authB.error.message}`);
    const userB_id = authB.data.user.id;
    console.log(`✔ clientB autenticado via signInWithPassword (User ID: ${userB_id})`);

    // Cliente Anônimo (Zero JWT / Role anon)
    console.log(`✔ clientAnon pronto (Role anon / Sem JWT)\n`);

    const evidenceTable = [];

    // ==========================================================================
    // CENÁRIO 01: USER_A lê exatamente o serviço da Empresa A
    // Asserts: HTTP 200, Array com 1 registro, ID do serviço == SERV_A_ID, tenant_id == ORG_A_ID
    // ==========================================================================
    {
        const start = Date.now();
        const res = await clientA.from('services').select('*').eq('tenant_id', ORG_A_ID);
        const elapsed = Date.now() - start;

        const isPass = !res.error && 
                       res.status === 200 && 
                       Array.isArray(res.data) && 
                       res.data.length === 1 && 
                       res.data[0].id === SERV_A_ID && 
                       res.data[0].tenant_id === ORG_A_ID;

        evidenceTable.push({
            id: 1,
            cenario: '01 - Leitura Própria Empresa A',
            identidade: `USER_A (${EMAIL_A})`,
            operacao: `GET /services?tenant_id=eq.${ORG_A_ID}`,
            http_status: res.status,
            registros_retornados: res.data ? res.data.length : 0,
            status: isPass ? 'PASS' : 'FAIL',
            observacao: isPass 
                ? `Validado com rigor: Retornou exatamente 1 serviço próprio (${res.data[0].name}) vinculado ao tenant correto (${elapsed}ms).` 
                : `FALHA: Status HTTP ${res.status}, Erro: ${res.error?.message || 'Dados retornados divergentes'}`
        });
    }

    // ==========================================================================
    // CENÁRIO 02: USER_B lê exatamente o serviço da Empresa B
    // Asserts: HTTP 200, Array com 1 registro, ID do serviço == SERV_B_ID, tenant_id == ORG_B_ID
    // ==========================================================================
    {
        const start = Date.now();
        const res = await clientB.from('services').select('*').eq('tenant_id', ORG_B_ID);
        const elapsed = Date.now() - start;

        const isPass = !res.error && 
                       res.status === 200 && 
                       Array.isArray(res.data) && 
                       res.data.length === 1 && 
                       res.data[0].id === SERV_B_ID && 
                       res.data[0].tenant_id === ORG_B_ID;

        evidenceTable.push({
            id: 2,
            cenario: '02 - Leitura Própria Empresa B',
            identidade: `USER_B (${EMAIL_B})`,
            operacao: `GET /services?tenant_id=eq.${ORG_B_ID}`,
            http_status: res.status,
            registros_retornados: res.data ? res.data.length : 0,
            status: isPass ? 'PASS' : 'FAIL',
            observacao: isPass 
                ? `Validado com rigor: Retornou exatamente 1 serviço próprio (${res.data[0].name}) vinculado ao tenant correto (${elapsed}ms).` 
                : `FALHA: Status HTTP ${res.status}, Erro: ${res.error?.message || 'Dados retornados divergentes'}`
        });
    }

    // ==========================================================================
    // CENÁRIO 03: USER_A tenta ler serviços da Empresa B
    // Asserts: HTTP 200 (sucesso da query), SEM erro de rede/500, Array com 0 registros
    // ==========================================================================
    {
        const start = Date.now();
        const res = await clientA.from('services').select('*').eq('tenant_id', ORG_B_ID);
        const elapsed = Date.now() - start;

        // Se houver erro de rede, 500, ou falha de schema -> FAIL. Só é PASS se a query rodar com 200 e retornar 0 linhas pelo RLS.
        const isPass = !res.error && 
                       res.status === 200 && 
                       Array.isArray(res.data) && 
                       res.data.length === 0;

        evidenceTable.push({
            id: 3,
            cenario: '03 - Tentativa Leitura Cruzada Serviços (A no B)',
            identidade: `USER_A (${EMAIL_A})`,
            operacao: `GET /services?tenant_id=eq.${ORG_B_ID}`,
            http_status: res.status,
            registros_retornados: res.data ? res.data.length : 0,
            status: isPass ? 'PASS' : 'FAIL',
            observacao: isPass 
                ? `Isolamento RLS comprovado: Query executada com HTTP 200 e filtrada para 0 registros (${elapsed}ms).` 
                : (res.error ? `FALHA TÉCNICA: Requisição falhou com erro ${res.error.code} (${res.error.message})` : `VAZAMENTO DE DADOS: Retornou ${res.data.length} registros!`)
        });
    }

    // ==========================================================================
    // CENÁRIO 04: USER_B tenta ler clientes da Empresa A
    // Asserts: HTTP 200 (sucesso da query), SEM erro de rede/500, Array com 0 registros
    // ==========================================================================
    {
        const start = Date.now();
        const res = await clientB.from('customers').select('*').eq('tenant_id', ORG_A_ID);
        const elapsed = Date.now() - start;

        const isPass = !res.error && 
                       res.status === 200 && 
                       Array.isArray(res.data) && 
                       res.data.length === 0;

        evidenceTable.push({
            id: 4,
            cenario: '04 - Tentativa Leitura Cruzada Clientes (B no A)',
            identidade: `USER_B (${EMAIL_B})`,
            operacao: `GET /customers?tenant_id=eq.${ORG_A_ID}`,
            http_status: res.status,
            registros_retornados: res.data ? res.data.length : 0,
            status: isPass ? 'PASS' : 'FAIL',
            observacao: isPass 
                ? `Isolamento LGPD comprovado: Query executada com HTTP 200 e filtrada para 0 clientes (${elapsed}ms).` 
                : (res.error ? `FALHA TÉCNICA: Requisição falhou com erro ${res.error.code} (${res.error.message})` : `VAZAMENTO DE DADOS: Retornou ${res.data.length} clientes!`)
        });
    }

    // ==========================================================================
    // CENÁRIO 05: USER_A tenta inserir serviço na Empresa B
    // Asserts: Deve ser bloqueado especificamente pelo RLS WITH CHECK (erro 42501 ou mensagem de policy)
    // Erros de rede, sintaxe ou desconhecidos resultam em FAIL.
    // ==========================================================================
    {
        const start = Date.now();
        const res = await clientA.from('services').insert({
            tenant_id: ORG_B_ID,
            name: '[INVASAO] Servico A no B',
            vehicle_type: 'CARRO',
            price: 99.00,
            duration_minutes: 30
        }).select();
        const elapsed = Date.now() - start;

        const isRlsRejection = res.error !== null && (
            res.error.code === '42501' || 
            res.status === 403 || 
            (res.error.message && res.error.message.toLowerCase().includes('row-level security'))
        );

        evidenceTable.push({
            id: 5,
            cenario: '05 - Tentativa Inserção Cruzada de Serviço (A no B)',
            identidade: `USER_A (${EMAIL_A})`,
            operacao: `POST /services (tenant_id = Org B)`,
            http_status: res.status,
            registros_retornados: res.data ? res.data.length : 0,
            status: isRlsRejection ? 'PASS' : 'FAIL',
            observacao: isRlsRejection 
                ? `Bloqueio específico de segurança confirmado: Rejeitado por violação de RLS WITH CHECK (${res.error.code || res.status} • ${res.error.message}) em ${elapsed}ms.` 
                : (res.error ? `FALHA: Erro inesperado não relacionado a RLS: ${res.error.message}` : `GRAVE: Inserção cruzada foi permitida no banco!`)
        });
    }

    // ==========================================================================
    // CENÁRIO 06: USER_A tenta modificar cliente da Empresa B + CONTRAPROVA
    // Asserts: HTTP 200, 0 linhas modificadas + Leitura com clientB confirmando nome inalterado
    // ==========================================================================
    {
        const start = Date.now();
        // Tentativa de update malicioso
        const res = await clientA.from('customers').update({
            name: '[INVASAO] Nome Alterado por A'
        }).eq('id', CUST_B_ID).select();
        const elapsed = Date.now() - start;

        // Contraprova: Leitura legítima por USER_B para validar integridade
        const verifyRes = await clientB.from('customers').select('name').eq('id', CUST_B_ID).single();

        const isZeroModified = !res.error && Array.isArray(res.data) && res.data.length === 0;
        const isDataIntact = !verifyRes.error && verifyRes.data && verifyRes.data.name === '[TESTE] Cliente VIP B';

        const isPass = isZeroModified && isDataIntact;

        evidenceTable.push({
            id: 6,
            cenario: '06 - Tentativa Modificação Cruzada Cliente (A no B)',
            identidade: `USER_A (${EMAIL_A})`,
            operacao: `PATCH /customers?id=eq.${CUST_B_ID}`,
            http_status: res.status,
            registros_retornados: res.data ? res.data.length : 0,
            status: isPass ? 'PASS' : 'FAIL',
            observacao: isPass 
                ? `Integridade comprovada com contraprova: 0 linhas afetadas pelo hacker e cliente VIP B confirmado intacto no banco ("${verifyRes.data.name}") em ${elapsed}ms.` 
                : `FALHA: Modificação indevida detectada ou contraprova divergente!`
        });
    }

    // ==========================================================================
    // CENÁRIO 07: USER_B tenta excluir agendamento da Empresa A + CONTRAPROVA
    // Asserts: HTTP 200, 0 linhas excluídas + Leitura com clientA confirmando agendamento existente
    // ==========================================================================
    {
        const start = Date.now();
        // Tentativa de delete malicioso
        const res = await clientB.from('appointments').delete().eq('id', APPT_A_ID).select();
        const elapsed = Date.now() - start;

        // Contraprova: Leitura legítima por USER_A para validar que o agendamento permanece ativo
        const verifyRes = await clientA.from('appointments').select('id, customer_name').eq('id', APPT_A_ID).single();

        const isZeroDeleted = !res.error && Array.isArray(res.data) && res.data.length === 0;
        const isStillExists = !verifyRes.error && verifyRes.data && verifyRes.data.id === APPT_A_ID;

        const isPass = isZeroDeleted && isStillExists;

        evidenceTable.push({
            id: 7,
            cenario: '07 - Tentativa Exclusão Cruzada Agendamento (B no A)',
            identidade: `USER_B (${EMAIL_B})`,
            operacao: `DELETE /appointments?id=eq.${APPT_A_ID}`,
            http_status: res.status,
            registros_retornados: res.data ? res.data.length : 0,
            status: isPass ? 'PASS' : 'FAIL',
            observacao: isPass 
                ? `Imutabilidade comprovada com contraprova: 0 linhas deletadas e agendamento da Empresa A confirmado ativo no banco ("${verifyRes.data.customer_name}") em ${elapsed}ms.` 
                : `FALHA: Exclusão indevida detectada ou agendamento desaparecido!`
        });
    }

    // ==========================================================================
    // CENÁRIO 08: clientAnon tenta usar service_id da Empresa B no slug da Empresa A
    // Asserts: Deve falhar especificamente por incompatibilidade de serviço na RPC
    // ==========================================================================
    {
        const start = Date.now();
        const res = await clientAnon.rpc('create_public_appointment', {
            p_slug: 'teste-lava-rapido-salinas-a',
            p_service_id: SERV_B_ID, // Pertence à Org B!
            p_customer_name: 'Cliente Hacker Teste',
            p_customer_phone: '(38) 99999-8888',
            p_vehicle_plate: 'HCK0A00',
            p_scheduled_at: new Date(Date.now() + 86400000).toISOString()
        });
        const elapsed = Date.now() - start;

        const isSpecificRpcRejection = res.error !== null && (
            res.error.message.toLowerCase().includes('serviço') ||
            res.error.message.toLowerCase().includes('service') ||
            res.error.message.toLowerCase().includes('inválido') ||
            res.error.message.toLowerCase().includes('pertence') ||
            res.error.code === 'P0001'
        );

        evidenceTable.push({
            id: 8,
            cenario: '08 - RPC Pública Anti Cross-Tenant (Agendamento)',
            identidade: 'ANÔNIMO (Role anon / Sem JWT)',
            operacao: `POST /rpc/create_public_appointment (Slug A + Serviço B)`,
            http_status: res.status,
            registros_retornados: res.data ? 1 : 0,
            status: isSpecificRpcRejection ? 'PASS' : 'FAIL',
            observacao: isSpecificRpcRejection 
                ? `Rejeição server-side específica comprovada: "${res.error.message}" (${res.error.code}) em ${elapsed}ms.` 
                : (res.error ? `FALHA: RPC falhou por motivo inesperado: ${res.error.message}` : `GRAVE: RPC permitiu agendamento com serviço de outra empresa!`)
        });
    }

    return evidenceTable;
}

// Execução direta
if (process.argv[1] && process.argv[1].includes('exec_teste_isolamento_api_real.js')) {
    (async () => {
        try {
            const table = await runRealApiIsolationTests();
            console.log('\n--- MATRIZ REAL DE EVIDÊNCIAS DE ISOLAMENTO (CALCULADA EM RUNTIME) ---');
            console.table(table.map(r => ({
                '#': r.id,
                'CENÁRIO': r.cenario,
                'IDENTIDADE': r.identidade,
                'HTTP': r.http_status,
                'REGISTROS': r.registros_retornados,
                'STATUS': r.status,
                'OBSERVAÇÃO': r.observacao
            })));
        } catch (err) {
            console.error('ERRO CRÍTICO NA EXECUÇÃO:', err.message);
            process.exit(1);
        }
    })();
}
