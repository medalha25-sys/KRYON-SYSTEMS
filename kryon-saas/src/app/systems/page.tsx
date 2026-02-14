'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Dog, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Subscription = {
  id: string
  status: 'active' | 'trial' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused' | 'expired'
  trial_end: string | null
  product_slug: string
  products: {
    name: string
    description: string
  }
}

export default function SystemsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  function getStatusScore(status: string) {
      if (['active', 'trial', 'trialing'].includes(status)) return 2
      if (['past_due', 'unpaid'].includes(status)) return 1
      return 0
  }

  useEffect(() => {
    async function fetchSystems() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch subscriptions with product details
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          trial_end,
          product_slug,
          products (
            name,
            description
          )
        `)
        .eq('user_id', user.id)
        
      if (data) {
        // Sort: Active/Trial first, then others
        const sorted = (data as any[]).sort((a, b) => {
            const scoreA = getStatusScore(a.status)
            const scoreB = getStatusScore(b.status)
            return scoreB - scoreA
        })
        setSubscriptions(sorted)
      }
      setLoading(false)
    }

    fetchSystems()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-8">
             <div>
                <h1 className="text-3xl font-bold mb-2">Meus Sistemas</h1>
                <p className="text-gray-400">Aqui estão todos os sistemas que você possui na Kryon Systems. Clique em “Acessar” para entrar no sistema desejado.</p>
             </div>
             <Link href="/#solucoes" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition border border-gray-700">
                + Novo Sistema
             </Link>
        </header>

        {subscriptions.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800">
                <h2 className="text-xl font-bold mb-4">Nenhum sistema encontrado</h2>
                <p className="text-gray-400 mb-8">Você ainda não possui nenhuma assinatura ativa.</p>
                <Link href="/#solucoes" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition">
                    Ver Soluções
                </Link>
            </div>
        ) : (
            <div className="grid gap-6">
            {subscriptions.map((sub) => (
                <motion.div 
                    key={sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-blue-500/30 transition-colors"
                >
                    <div className="flex items-start gap-4 md:gap-6">
                        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                            {getIconForProduct(sub.product_slug)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-bold">{sub.products.name}</h2>
                                <StatusBadge status={sub.status} />
                            </div>
                            <p className="text-gray-400 text-sm mb-3 max-w-lg">{sub.products.description}</p>
                            
                            {(sub.status === 'trial' || sub.status === 'trialing') && sub.trial_end && (
                                <div className="flex items-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full w-fit">
                                    <Clock className="w-3 h-3" />
                                    <span>Teste grátis até {format(new Date(sub.trial_end), "d 'de' MMMM", { locale: ptBR })}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <Link 
                            href={`/products/${sub.product_slug}`}
                            className={`px-6 py-3 rounded-xl font-bold text-center transition flex items-center justify-center gap-2 ${
                                ['active', 'trial', 'trialing'].includes(sub.status)
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                            }`}
                            aria-disabled={!['active', 'trial', 'trialing'].includes(sub.status)}
                        >
                            {['active', 'trial', 'trialing'].includes(sub.status) ? (
                                <>Acessar Sistema <ArrowRight className="w-4 h-4" /></>
                            ) : (
                                'Indisponível'
                            )}
                        </Link>
                        
                        {!['active', 'trial', 'trialing'].includes(sub.status) && (
                             <Link 
                                href="/billing" 
                                className="text-center text-sm text-blue-400 hover:text-blue-300 underline"
                            >
                                Reativar Assinatura
                            </Link>
                        )}
                    </div>
                </motion.div>
            ))}
            </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'active') {
        return (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 uppercase tracking-wide">
                <CheckCircle className="w-3 h-3" /> Plano ativo
            </span>
        )
    }
    if (status === 'trial' || status === 'trialing') {
         return (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 uppercase tracking-wide">
                <Clock className="w-3 h-3" /> Teste ativo
            </span>
        )
    }
    if (status === 'past_due' || status === 'unpaid') {
         return (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 uppercase tracking-wide">
                <AlertCircle className="w-3 h-3" /> Pagamento Pendente
            </span>
        )
    }
    return (
        <span className="px-2.5 py-0.5 rounded-full bg-gray-700 text-gray-400 text-xs font-bold border border-gray-600 uppercase tracking-wide">
            Teste expirado
        </span>
    )
}

function getIconForProduct(slug: string) {
  switch (slug) {
    case 'agenda-facil':
      return <Calendar className="w-6 h-6 text-blue-400" />
    case 'gestao-pet':
      return <Dog className="w-6 h-6 text-orange-400" />
    default:
      return <Calendar className="w-6 h-6 text-gray-400" />
  }
}
