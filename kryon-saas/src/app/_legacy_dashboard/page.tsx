import { createClient } from '@/utils/supabase/server'
import ERPDashboard from '@/components/ERPDashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_id, shops(name, plan, trial_ate)')
    .eq('id', user?.id)
    .single()

  const shop = profile?.shops as any
  
  const trialEnds = shop?.trial_ate ? new Date(shop.trial_ate) : null
  const daysRemaining = trialEnds 
    ? Math.max(0, Math.ceil((trialEnds.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div>
      {shop?.plan === 'trial' && (
        <div className="mx-6 md:mx-12 mt-6">
          <div className="trialBadge" style={{ 
            background: daysRemaining <= 2 ? 'rgba(255, 59, 48, 0.1)' : 'rgba(0, 242, 255, 0.1)',
            border: daysRemaining <= 2 ? '1px solid rgba(255, 59, 48, 0.2)' : '1px solid rgba(0, 242, 255, 0.2)',
            color: daysRemaining <= 2 ? '#ff3b30' : '#00f2ff',
            padding: '12px 20px',
            borderRadius: '16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'inline-block'
          }}>
            🚀 Seu teste grátis termina em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}. Ative sua assinatura para não perder o acesso!
          </div>
        </div>
      )}
      <ERPDashboard />
    </div>
  )
}
