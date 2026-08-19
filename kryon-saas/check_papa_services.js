const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://pgpobxvkojawrstadrel.supabase.co',
    'sb_secret_u35x_HnQT3lnHtSgY-90NQ_lhN4oMb-'
);

async function inspect() {
    const shopId = '9df44da8-ed46-43d5-8c47-bc54f18889bf';
    console.log(`Checking services for shop: ${shopId}`);
    
    const { data, error } = await supabase
        .from('lava_rapido_services')
        .select('*')
        .eq('tenant_id', shopId);

    if (error) {
        console.error("Fetch Error:", error);
    } else {
        console.log("Services found:", data.length);
        data.forEach(s => {
            console.log(`- Service: ${s.name}, Active: ${s.active}, Price: ${s.price}, Tenant: ${s.tenant_id}`);
        });

        if (data.length === 0) {
            console.log("\nChecking ALL services to see if any are still unlinked...");
            const { data: all } = await supabase.from('lava_rapido_services').select('name, tenant_id, active').limit(20);
            console.log("All services sample:", all);
        }
    }
}

inspect();
