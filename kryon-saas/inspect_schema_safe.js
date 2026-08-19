const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://pgpobxvkojawrstadrel.supabase.co',
    'sb_secret_u35x_HnQT3lnHtSgY-90NQ_lhN4oMb-'
);

async function inspect() {
    console.log("Listing keys of a sample shop row...");
    const { data, error } = await supabase
        .from('shops')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Fetch Error:", error);
    } else if (data && data.length > 0) {
        console.log("Found shops:", data.length);
        console.log("Keys:", Object.keys(data[0]));
        console.log("Sample Data:", JSON.stringify(data[0], null, 2));
    } else {
        console.log("No shops found in the table.");
    }
}

inspect();
