'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function LoginTest() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDebugInfo() {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      let profile = null;
      let shop = null;
      let subscriptions = [];

      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        profile = p;

        if (p?.shop_id) {
            const { data: s } = await supabase.from('shops').select('*').eq('id', p.shop_id).single();
            shop = s;
        }

        const { data: subs } = await supabase.from('subscriptions').select('*').eq('user_id', user.id);
        subscriptions = subs || [];
      }

      setDebugData({
        env: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'undefined'
        },
        user,
        profile,
        shop,
        subscriptions,
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }

    getDebugInfo();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Carregando dados de debug...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Session & Env</h1>
      <pre style={{ background: '#f5f5f5', p: '15px', borderRadius: '8px', overflow: 'auto' }}>
        {JSON.stringify(debugData, null, 2)}
      </pre>
    </div>
  )
}
