'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Check, Zap, Shield } from 'lucide-react'
import { MercadoPagoService } from '@/lib/mercadopago' 
import { createSubscriptionPreference } from './actions' // Note: This needs to be a Server Action ideally to hide token
// Since we are Client Side, we must call a Server Action.

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchSub() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
      if (!profile?.organization_id) return

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*, products(*)')
        .eq('organization_id', profile.organization_id)
        .eq('products.slug', 'agenda-facil') // Hardcoded for now
        .single()
      
      setCurrentPlan(sub)
      setLoading(false)
    }
    fetchSub()
  }, [])

  const handleUpgrade = async () => {
    if (!currentPlan?.organization_id) return
    
    const res = await createSubscriptionPreference(
        currentPlan.organization_id, 
        window.location.href // Current URL for back_url
    )

    if (res.error) {
        alert("Erro ao criar pagamento: " + res.error)
    } else if (res.init_point) {
        window.location.href = res.init_point
    }
  }

  if (loading) return <div className="p-8">Carregando informações do plano...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
        <header className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900">Assinatura e Cobrança</h1>
            <p className="text-gray-500">Gerencie o plano da sua clínica.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
            {/* Current Plan */}
            <div className="md:col-span-2">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-sm font-bold text-blue-500 uppercase tracking-wide">Plano Atual</span>
                            <h2 className="text-2xl font-bold mt-1">{currentPlan?.products?.name || 'Gratuito'}</h2>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
                            currentPlan?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {currentPlan?.status || 'Inativo'}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-600">
                             <Check size={18} className="text-green-500" />
                             <span>Acesso completo ao sistema</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                             <Check size={18} className="text-green-500" />
                             <span>Agenda multi-profissional</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
                    <Zap size={200} />
                </div>
                
                <h3 className="text-xl font-bold mb-2">Faça o Upgrade</h3>
                <p className="text-blue-100 mb-6 text-sm">Desbloqueie todos os recursos e remova limites.</p>
                
                <button 
                    onClick={handleUpgrade}
                    className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
                >
                    Assinar Agora
                </button>
            </div>
        </div>
    </div>
  )
}
