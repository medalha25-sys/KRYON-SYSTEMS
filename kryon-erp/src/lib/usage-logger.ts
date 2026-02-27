import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'

/**
 * Middleware helper to track organization usage
 * Should be called in `middleware.ts` or specific server actions
 */
export async function trackUsage(req: NextRequest, response: any) {
    // This would ideally fire after response to not block
    // Using simple approach: increment 'login' or 'request'
    // ...
    // Since Next.js Middleware Edge doesn't support direct DB easy, 
    // we use a background worker or simpler: Track major actions in Server Actions.
    // Let's stick to Server Action tracking we added in 'financial.ts' and specific points.
    
    // However, we can create a simple 'logEvent' function for server actions to call.
}

// In a real high-scale SaaS, we'd use Logflare or Tinybird.
// For now, we use Postgres 'increment_org_stat' function we created.

// Example usage in an action:
/*
   await supabaseAdmin.rpc('increment_org_stat', { 
       org_id: orgId, 
       stat_type: 'appointment',
       amount: 1 
   })
*/
