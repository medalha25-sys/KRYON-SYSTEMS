'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Dog, Scale, Building2 } from 'lucide-react'

type Product = {
  id: string
  slug: string
  name: string
  description: string
}

export default function ProductSelector() {
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

      // Fetch subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('product_slug')
        .eq('user_id', user.id)
        .in('status', ['active', 'trial'])

      if (!subscriptions || subscriptions.length === 0) {
        // No active subscription, maybe redirect to landing or trial
        router.push('/#solucoes')
        return
      }

       // Fetch product details for these slugs
       const slugs = subscriptions.map(s => s.product_slug)
       const { data: productsData } = await supabase
         .from('products')
         .select('*')
         .in('slug', slugs)

       if (productsData) {
         setProducts(productsData)
       }
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
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
             <h1 className="text-3xl font-bold mb-2">Meus Sistemas</h1>
             <p className="text-gray-400">Selecione qual sistema você deseja acessar agora.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {products.map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${product.slug}`}
              className="block group"
            >
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-8 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gray-800 group-hover:bg-blue-900/30 transition-colors`}>
                    {getIconForProduct(product.slug)}
                  </div>
                  <ArrowRight className="text-gray-500 group-hover:text-blue-400 transition" />
                </div>
                
                <h2 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition">{product.name}</h2>
                <p className="text-gray-400 text-sm">{product.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 text-center">
            <Link href="/#solucoes" className="text-gray-500 hover:text-white text-sm transition">
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
      return <Calendar className="w-6 h-6 text-blue-400" />
    case 'gestao-pet':
      return <Dog className="w-6 h-6 text-orange-400" />
    case 'kryon-law':
      return <Scale className="w-6 h-6 text-amber-500" />
    case 'concrete-erp':
      return <Building2 className="w-6 h-6 text-orange-600" />
    default:
      return <Calendar className="w-6 h-6 text-gray-400" />
  }
}
