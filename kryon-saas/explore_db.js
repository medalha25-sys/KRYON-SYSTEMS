const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pgpobxvkojawrstadrel.supabase.co',
  'sb_secret_u35x_HnQT3lnHtSgY-90NQ_lhN4oMb-'
);

async function explore() {
    console.log("Testing join between profiles and shops...");
    const { data: profileWithShop, error } = await supabase
        .from('profiles')
        .select('is_super_admin, shops(store_type)')
        .limit(1);
    
    if (error) {
        console.error("JOIN ERROR:", error.message);
        console.error("DETAILS:", error.details);
        console.error("CODE:", error.code);
    } else {
        console.log("JOIN SUCCESS:", JSON.stringify(profileWithShop, null, 2));
    }

    console.log("\nTesting separate queries as fallback...");
    const { data: p } = await supabase.from('profiles').select('id, email, is_super_admin, shop_id').limit(1);
    console.log("Profile sample:", p);
    if (p && p[0].shop_id) {
        const { data: s } = await supabase.from('shops').select('*').eq('id', p[0].shop_id).maybeSingle();
        console.log("Shop sample:", s);
    }
}

explore();
