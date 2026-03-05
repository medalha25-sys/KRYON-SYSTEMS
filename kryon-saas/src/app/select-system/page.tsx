'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Dog } from 'lucide-react'

type Product = {
  id: string
  slug: string
  name: string
  description: string
}

export default function SelectSystemPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    }>
      <SelectSystemContent />
    </Suspense>
  )
}

function SelectSystemContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      toast.error(message)
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.warn('SELECT SYSTEM: No user found, redirecting to login.')
          router.push('/login')
          return
        }

        // 1. Get Organization ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id, is_super_admin')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
            console.error('SELECT SYSTEM: Profile fetch error:', profileError)
        }

        if (!profile?.organization_id && !profile?.is_super_admin) {
           console.warn('SELECT SYSTEM: No organization found for user:', user.id)
           router.push('/login?message=Organização não encontrada. Por favor, entre em contato com o suporte.') 
           return
        }

        // 1.5 Handle Super Admin (Only redirect if they don't have a specific org context they are trying to access)
        // If they are strictly super admin and just want the dashboard
        if (profile?.is_super_admin && !profile?.organization_id) {
             console.log('SELECT SYSTEM: Super Admin bypass to dashboard')
             router.push('/super-admin')
             return
        }

        // 2. Fetch subscriptions with product details for this organization
        // Resolve PGRST201 by specifying the foreign key (product_id)
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('*, products!subscriptions_product_id_fkey(*)')
          .eq('organization_id', profile?.organization_id || '00000000-0000-0000-0000-000000000000')
          .in('status', ['active', 'trial'])

        if (subError) {
          console.error('SELECT SYSTEM: Subscription fetch error:', subError)
        }

        const productsData = (subscriptions || [])
          .map(sub => {
              if (sub.products) return sub.products;
              // Fallback se o produto sumiu mas a assinatura existe
              if (sub.product_slug) return { 
                  id: sub.id, 
                  slug: sub.product_slug, 
                  name: sub.product_slug.replace(/-/g, ' ').toUpperCase(),
                  description: 'Acesso via assinatura'
              };
              return null;
          })
          .filter(p => p !== null) as Product[]

        console.log('SELECT SYSTEM: Products found:', productsData.length, productsData)

        // 3. Automatic Redirections (Guard Clauses)
        const concreteProduct = productsData.find(p => p.slug === 'concrete-erp' || p.slug === 'industrial');

        if (concreteProduct || productsData.length === 1) {
            const product = concreteProduct || productsData[0]
            let targetPath = product.slug === 'concrete-erp' ? '/concrete' : `/products/${product.slug}`
            
            // Custom routing overrides
            if (product.slug === 'fashion-ai' || product.slug === 'fashion-store-ai') {
              targetPath = '/fashion/dashboard'
            } else if (product.slug === 'concrete-erp' || product.slug === 'industrial') {
              targetPath = '/concrete'
            } else if (product.slug === 'agenda-facil' || product.slug === 'agenda-facil-ai') {
              targetPath = '/products/agenda-facil'
            } else if (product.slug === 'lava-rapido') {
              targetPath = '/products/lava-rapido'
            }

            console.log('SELECT SYSTEM: Priority system found, redirecting to:', targetPath)
            router.replace(targetPath)
            return
        }

        if (productsData.length === 0) {
            // Case 1: Super Admin with no products can still go to super-admin
            if (profile?.is_super_admin) {
                router.push('/super-admin')
                return
            }
            // Case 2: Regular user with no products
            console.warn('SELECT SYSTEM: No active subscriptions found.')
            router.push('/login?message=Nenhuma assinatura ativa encontrada para sua conta.')
            return
        }

        // More than 1 system: show selection
        setProducts(productsData)
      } catch (err) {
        console.error('SELECT SYSTEM: Unexpected error:', err)
        toast.error('Ocorreu um erro ao carregar seus sistemas.')
      } finally {
        setLoading(false)
      }
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
              href={product.slug === 'concrete-erp' ? '/concrete' : `/products/${product.slug}`}
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
    case 'lava-rapido':
      return <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}><Calendar className="w-8 h-8 text-blue-500" /></motion.div>
    default:
      return <Calendar className="w-8 h-8 text-gray-400" />
  }
}
