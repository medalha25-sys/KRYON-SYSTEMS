const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://pgpobxvkojawrstadrel.supabase.co',
    'sb_secret_u35x_HnQT3lnHtSgY-90NQ_lhN4oMb-'
);

async function inspect() {
    const { data, error } = await supabase.from('shops').select('*').limit(1);
    if (data && data[0]) {
        console.log("KEYS_START");
        console.log(Object.keys(data[0]).join(','));
        console.log("KEYS_END");
    } else {
        console.log("NO_DATA");
    }
}
inspect();
