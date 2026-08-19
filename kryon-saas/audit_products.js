const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://pgpobxvkojawrstadrel.supabase.co',
    'sb_secret_u35x_HnQT3lnHtSgY-90NQ_lhN4oMb-'
);

async function audit() {
    console.log("Auditing products table...");
    const { data, error } = await supabase.from('products').select('*');
    if (error) console.error(error);
    else {
        data.forEach(p => {
            console.log(`Product: "${p.name}", Slug: "${p.slug}"`);
        });
    }
}
audit();
