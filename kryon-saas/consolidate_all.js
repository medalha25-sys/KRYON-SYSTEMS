const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://pgpobxvkojawrstadrel.supabase.co',
    'sb_secret_u35x_HnQT3lnHtSgY-90NQ_lhN4oMb-'
);

async function finalFix() {
    const targetShopId = '9df44da8-ed46-43d5-8c47-bc54f18889bf';
    
    console.log(`Consolidating ALL services to shop: ${targetShopId}`);
    
    // Services
    const { data: sData, error: sError } = await supabase
        .from('lava_rapido_services')
        .update({ tenant_id: targetShopId })
        .neq('tenant_id', targetShopId)
        .select();

    if (sError) console.error("Services Consolidation Error:", sError);
    else console.log("Services consolidated:", sData?.length || 0);

    // Bookings
    const { data: bData, error: bError } = await supabase
        .from('lava_rapido_bookings')
        .update({ tenant_id: targetShopId })
        .neq('tenant_id', targetShopId)
        .select();

    if (bError) console.error("Bookings Consolidation Error:", bError);
    else console.log("Bookings consolidated:", bData?.length || 0);

    // Final check
    const { data: check } = await supabase
        .from('lava_rapido_services')
        .select('name, tenant_id')
        .eq('tenant_id', targetShopId);
    
    console.log(`Verification: ${check?.length || 0} services now belong to Papa Leguas.`);
}

finalFix();
