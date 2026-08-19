const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function inspect() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("Inspecting 'shops' table columns...");
    const { data, error } = await supabase.rpc('execute_sql', {
        query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'shops'"
    });

    if (error) {
        // Fallback: try raw query if RPC not enabled
        const { data: rawData, error: rawError } = await supabase
            .from('shops')
            .select('*')
            .limit(1);
        
        if (rawError) {
            console.error("Error fetching shop sample:", rawError);
        } else {
            console.log("Sample row keys:", Object.keys(rawData[0] || {}));
        }
    } else {
        console.log("Columns:", data.map(c => c.column_name));
    }
}

inspect();
