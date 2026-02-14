'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Dog } from 'lucide-react'

type Product = {
  id: string
  slug: string
  name: string
  description: string
}

export default function SelectSystemPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProducts() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch subscriptions with product details
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*, products(*)')
        .eq('tenant_id', user.id)
        .in('status', ['active', 'trial'])

      if (subError || !subscriptions || subscriptions.length === 0) {
        console.log('No active subscriptions found for user:', user.id)
        router.push('/') // Redirect to landing if no access
        return
      }

      // Map joined data to products state
      const productsData = subscriptions
        .map(sub => sub.products)
        .filter(p => p !== null) as Product[]

      setProducts(productsData)
      setLoading(false)
    }

    fetchProducts()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <header className="mb-12 text-center">
             <h1 className="text-3xl md:text-4xl font-bold mb-4">Escolha o sistema que deseja acessar</h1>
             <p className="text-gray-400 text-lg">
                Você possui mais de um sistema ativo.<br/>
                Selecione abaixo qual deseja utilizar agora.
             </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {products.map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${product.slug}`}
              className="block group"
            >
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-8 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20 h-full flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-xl bg-gray-800 group-hover:bg-blue-900/30 transition-colors`}>
                    {getIconForProduct(product.slug)}
                  </div>
                  <div className="px-4 py-2 bg-green-500/10 text-green-400 text-xs font-bold rounded-full uppercase tracking-wide">
                      Acessar
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition">{product.name}</h2>
                <p className="text-gray-400 text-sm flex-grow leading-relaxed">{product.description}</p>
                
                <div className="mt-6 pt-6 border-t border-gray-800 flex items-center text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Entrar no sistema <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
        
        <div className="mt-16 text-center">
            <Link href="/#solucoes" className="text-gray-500 hover:text-white text-sm transition border-b border-gray-700 hover:border-white pb-1">
                + Contratar novo sistema
            </Link>
        </div>
      </div>
    </div>
  )
}

function getIconForProduct(slug: string) {
  switch (slug) {
    case 'agenda-facil':
      return <Calendar className="w-8 h-8 text-blue-400" />
    case 'gestao-pet':
      return <Dog className="w-8 h-8 text-orange-400" />
    default:
      return <Calendar className="w-8 h-8 text-gray-400" />
  }
}
