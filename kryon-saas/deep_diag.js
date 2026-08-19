const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://pgpobxvkojawrstadrel.supabase.co',
    'sb_secret_u35x_HnQT3lnHtSgY-90NQ_lhN4oMb-'
);

async function diagnostic() {
    console.log("Fetching ALL services to see exact tenant_id values...");
    const { data, error } = await supabase
        .from('lava_rapido_services')
        .select('name, tenant_id');

    if (error) {
        console.error(error);
    } else {
        data.forEach(s => {
            console.log(`Service: "${s.name}"`);
            console.log(`  Tenant ID: "${s.tenant_id}"`);
            console.log(`  Length: ${s.tenant_id?.length}`);
            console.log(`  Type: ${typeof s.tenant_id}`);
        });

        const unique = [...new Set(data.map(d => d.tenant_id))];
        console.log("\nUnique Set:", unique);
    }
}

diagnostic();
