const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://pgpobxvkojawrstadrel.supabase.co',
    'sb_secret_u35x_HnQT3lnHtSgY-90NQ_lhN4oMb-'
);

async function fix() {
    const targetShopId = '9df44da8-ed46-43d5-8c47-bc54f18889bf';
    const strayIds = ['d5aa74dd-06bf-4074-be48-356aae2e3f53', '6a7b450b-b376-3819-cf8c-fcade1dd0e37'];

    console.log(`Relinking services for shop: ${targetShopId}`);
    
    // Services
    const { data: sData, error: sError } = await supabase
        .from('lava_rapido_services')
        .update({ tenant_id: targetShopId })
        .in('tenant_id', strayIds)
        .select();

    if (sError) console.error("Services Update Error:", sError);
    else console.log("Services updated:", sData?.length || 0);

    // Bookings
    const { data: bData, error: bError } = await supabase
        .from('lava_rapido_bookings')
        .update({ tenant_id: targetShopId })
        .in('tenant_id', strayIds)
        .select();

    if (bError) console.error("Bookings Update Error:", bError);
    else console.log("Bookings updated:", bData?.length || 0);

    // Verify
    const { data: finalServices } = await supabase
        .from('lava_rapido_services')
        .select('name, tenant_id')
        .eq('tenant_id', targetShopId);
    
    console.log("Final services for Papa Leguas:", finalServices?.length || 0);
}

fix();
