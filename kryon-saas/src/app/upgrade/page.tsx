'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createCheckoutPreference } from './actions'

type Product = {
    name: string
    description: string
}

import { Suspense } from 'react'

function UpgradeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reason = searchParams.get('reason')
  const productSlug = searchParams.get('product')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
      async function fetchProduct() {
          if (!productSlug) return
          
          const supabase = createClient()
          const { data } = await supabase
            .from('products')
            .select('name, description')
            .eq('slug', productSlug)
            .single()
            
          if (data) {
              setProduct(data)
          }
          setLoading(false)
      }
      fetchProduct()
  }, [productSlug])

  const getMessage = () => {
      switch(reason) {
          case 'expired':
              return 'Seu período de teste expirou.'
          case 'canceled':
              return 'Sua assinatura foi cancelada.'
          case 'blocked':
              return 'Sua conta está suspensa temporariamente.'
          case 'past_due':
              return 'Há um pagamento pendente em sua conta.'
          default:
              return 'É necessário atualizar seu plano.'
      }
  }

  const getPrice = () => {
      if (productSlug === 'agenda-facil') return 'R$ 49,90'
      if (productSlug === 'gestao-pet') return 'R$ 89,90'
      return 'Sob Consulta'
  }

  if (loading) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center bg-gray-900 border border-gray-800 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Background Blur Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {reason === 'expired' ? 'Seu teste gratuito terminou' : 'Acesso Bloqueado'}
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
                {reason === 'expired' 
                    ? 'Para continuar usando o sistema sem interrupções, assine o plano profissional.'
                    : <>{getMessage()} <br/> Para continuar usando o <span className="text-white font-bold">{product?.name || 'Sistema'}</span>, ative sua assinatura.</> }
            </p>
            
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 mb-8 text-left max-w-2xl mx-auto shadow-inner">
                <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{product?.name || 'Plano Profissional'}</h3>
                        <p className="text-gray-400 text-sm">Acesso completo + Suporte</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-3xl font-bold text-blue-400">{getPrice()}</span>
                        <span className="text-gray-500 text-sm">/mês</span>
                    </div>
                </div>

                <h4 className="font-bold text-gray-200 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    O que está incluso:
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                    <li className="flex gap-2 text-gray-300 items-center"><CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> Acesso completo</li>
                    <li className="flex gap-2 text-gray-300 items-center"><CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> Suporte incluso</li>
                    <li className="flex gap-2 text-gray-300 items-center"><CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> Sem fidelidade</li>
                    <li className="flex gap-2 text-gray-300 items-center"><CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> Atualizações constantes</li>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                    onClick={async () => {
                        setLoading(true)
                        const res = await createCheckoutPreference(productSlug || '')
                        if (res.url) {
                            window.location.href = res.url
                        } else {
                            setLoading(false)
                            alert(res.error || 'Erro ao gerar checkout')
                        }
                    }}
                    disabled={loading}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition shadow-lg shadow-blue-900/20 w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-105 transform duration-200 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Assinar Agora <ArrowRight className="w-5 h-5" /></>}
                </button>
                <Link href="/select-system" className="px-8 py-4 bg-transparent hover:bg-gray-800/50 text-gray-400 hover:text-white rounded-xl font-bold transition w-full sm:w-auto">
                    Voltar aos Sistemas
                </Link>
            </div>
            
            <p className="mt-8 text-sm text-gray-600">
                Seu pagamento é processado de forma segura.
            </p>
        </div>
      </div>
    </div>
  )
}

export default function UpgradePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>}>
            <UpgradeContent />
        </Suspense>
    )
}
