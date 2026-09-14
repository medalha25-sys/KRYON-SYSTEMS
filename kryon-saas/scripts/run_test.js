import fs from 'fs';
import path from 'path';

// Permitir certificados do ambiente Windows
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { runMultitenantIsolationTest } from './test_multitenant_api_v5_1.js';

// 1. Carregar variáveis de ambiente de forma segura e silenciosa
try {
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
} catch (e) {
    console.error('Erro ao ler .env.local:', e.message);
}

// 2. Executar teste
(async () => {
    try {
        const results = await runMultitenantIsolationTest();
        console.log('\n--- RESULTADOS JSON ---');
        console.log(JSON.stringify(results, null, 2));
    } catch (err) {
        console.error('ERRO NA EXECUÇÃO DO TESTE:', err);
        process.exit(1);
    }
})();
