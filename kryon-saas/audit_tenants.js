const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://pgpobxvkojawrstadrel.supabase.co',
    'sb_secret_u35x_HnQT3lnHtSgY-90NQ_lhN4oMb-'
);

async function inspect() {
    console.log("Listing unique tenant_ids in lava_rapido_services...");
    const { data, error } = await supabase
        .from('lava_rapido_services')
        .select('tenant_id');

    if (error) {
        console.error("Error:", error);
    } else {
        const ids = [...new Set(data.map(d => d.tenant_id))];
        console.log("Unique IDs:", ids);
        
        // Also check shops to see which IDs are valid
        const { data: shops } = await supabase.from('shops').select('id, name');
        console.log("Valid Shops:", shops);
    }
}

inspect();
