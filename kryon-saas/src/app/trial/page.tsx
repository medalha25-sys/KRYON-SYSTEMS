'use client'

import { useSearchParams } from 'next/navigation'
import { signUpForTrial, getProductDetails } from './actions'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { MailCheck } from "lucide-react"
import { createClient } from '@/utils/supabase/client'

import { Suspense } from 'react'

function ConfirmEmailCard({ email }: { email: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <MailCheck className="h-16 w-16 text-blue-600" />
        </div>

        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          Confirme seu e-mail 📩
        </h2>

        <p className="text-lg text-blue-800 mb-2">
          Enviamos um link de confirmação para:
        </p>

        <p className="text-xl font-bold text-blue-900 mb-6 break-all">
          {email}
        </p>

        <div className="bg-white/50 rounded-lg p-4 mb-6">
          <p className="text-blue-700 leading-relaxed">
            Abra seu e-mail e clique no link para ativar sua conta e começar
            seu teste grátis de <strong>15 dias</strong>.
          </p>
        </div>

        <p className="text-sm text-blue-600 italic">
          Não esqueça de verificar a caixa de spam 😉
        </p>
        
        <button
          onClick={() => window.location.href = '/login?signup=success'}
          className="mt-8 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-lg"
        >
          Ir para Login
        </button>
      </div>
    </div>
  )
}

function SignupForm({ handleSubmit, loading, productSlug }: { handleSubmit: (formData: FormData) => void, loading: boolean, productSlug: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl grid md:grid-cols-2 bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Left Side - Info */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-blue-900 to-gray-900 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-6">Sistemas inteligentes para organizar e fazer seu negócio crescer 🚀</h2>
            <p className="text-gray-300 mb-8 text-lg">
                A <span className="text-white font-bold">Kryon Systems</span> cria soluções simples, rápidas e profissionais
                para quem quer controle, agilidade e mais clientes.
            </p>
            
            <ul className="space-y-4">
                <li className="flex items-center gap-3">
                    <span className="text-green-400 text-xl">✔</span> Teste grátis por 15 dias
                </li>
                <li className="flex items-center gap-3">
                    <span className="text-green-400 text-xl">✔</span> Sem cartão de crédito
                </li>
                <li className="flex items-center gap-3">
                    <span className="text-green-400 text-xl">✔</span> Cancele quando quiser
                </li>
            </ul>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-12 bg-white dark:bg-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Criar Conta</h1>
            
            <form action={handleSubmit} className="space-y-4">
                {/* Campo oculto para garantir que o slug do produto seja enviado */}
                <input type="hidden" name="product" value={productSlug} />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa</label>
                    <input
                        name="companyName"
                        required
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                        placeholder="Ex: Petshop do João"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seu Nome</label>
                    <input
                        name="name"
                        required
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                        placeholder="João Silva"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                        placeholder="seu@email.com"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                    <input
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                        placeholder="******"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition disabled:opacity-50 mt-4 shadow-lg hover:shadow-xl"
                >
                    {loading ? 'Criando conta...' : 'Começar Teste Grátis 🚀'}
                </button>
            </form>
             <p className="mt-4 text-xs text-center text-gray-500">
                Ao criar a conta, você concorda com nossos Termos de Uso.
            </p>
        </div>
      </motion.div>
    </div>
  )
}

function RegisterForm() {
  console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('SUPABASE ANON:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [productSlug, setProductSlug] = useState('')
  const [productData, setProductData] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfirmEmail, setShowConfirmEmail] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  useEffect(() => {
    const p = searchParams.get('product')

    if (typeof p === 'string' && p.trim().length > 0) {
      setProductSlug(p.trim())
    } else {
      setProductSlug('')
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchProduct() {
      if (!productSlug) return

      console.log('--- Passo 3: Buscando Produto ---')
      console.log('Slug usado:', productSlug)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', productSlug)
        .single()

      console.log('Data retornada:', data)
      console.log('Error retornado:', error)

      if (error) {
        setProductData(null)
        setErrorMsg('Produto não encontrado ou erro na busca.')
      } else {
        setProductData(data)
        setErrorMsg('')
      }
    }

    fetchProduct()
  }, [productSlug])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("confirmed") === "1") {
      window.location.href = "/login"
    }
  }, [])

  async function handleSubmit(formData: FormData) {
    const email = formData.get('email') as string
    console.log('Starting submission...')
    setLoading(true)
    formData.append('product', productSlug)
    
    try {
      const result = await signUpForTrial(formData)
      console.log('Submission result:', result)
      
      if (result && result.error) {
         toast.error(result.error)
      } else if (result && result.success) {
         setRegisteredEmail(email)
         setShowConfirmEmail(true)
      } else {
         console.error('Unexpected result format:', result)
         toast.error('Ocorreu um erro inesperado. Por favor, tente novamente ou contate o suporte.')
      }
    } catch (err) {
      console.error('Submission error:', err)
      toast.error('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-yellow-500 text-black text-center py-2 font-bold z-[100] text-sm">
        {/* DEBUG TEMPORÁRIO – NÃO REMOVER AINDA */}
        <p style={{ fontSize: 12, opacity: 0.7 }}>
          Produto recebido da URL: <b>{productSlug || '(vazio)'}</b>
        </p>
        <span className={errorMsg ? "text-red-800" : "text-green-800"}>
          Status DB: {errorMsg ? errorMsg : `Produto: ${productData?.name || 'Carregando...'}`}
        </span>
      </div>
      {showConfirmEmail ? (
        <ConfirmEmailCard email={registeredEmail} />
      ) : (
        <SignupForm handleSubmit={handleSubmit} loading={loading} productSlug={productSlug} />
      )}
    </>
  )
}

export default function TrialPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050507] flex items-center justify-center text-white">Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
