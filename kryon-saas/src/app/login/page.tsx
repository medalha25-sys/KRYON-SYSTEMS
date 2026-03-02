'use client'

import { useActionState, useEffect, useState, Suspense } from 'react'
import { login } from './actions'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

function LoginForm() {
  const searchParams = useSearchParams()
  
  // Debug logs for environment variables
  console.log('SUPABASE_URL_CLIENT:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SUPABASE_KEY_CLIENT:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'exists' : 'undefined');

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        const result = await login(prevState, formData) as any
        if (result?.success && result?.redirect) {
             console.log('Client Redirecting to:', result.redirect)
             // Show success state briefly if needed, but the UI handles 'isPending' which stops.
             // We can return a success message to display.
             window.location.href = result.redirect
             return { success: true, message: 'Login realizado! Redirecionando...' }
        }
        return { error: result?.error || null }
      } catch (e) {
         console.error(e)
         return { error: 'Erro inesperado na comunicação com o servidor.' }
      }
    },
    { error: null } as any
  )
  const [initialMessage, setInitialMessage] = useState<string | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSignupSuccess, setIsSignupSuccess] = useState(false)

  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) {
      setInitialMessage(msg);
      // Optional: clear the URL param after reading to prevent "stuck" errors on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
    }
    setIsConfirmed(searchParams.get('confirmed') === '1')
    setIsSignupSuccess(searchParams.get('signup') === 'success')
  }, [searchParams])

  // Only show initialMessage if there is no active server state error
  const errorMessage = state?.error || (state?.success ? null : initialMessage)

  return (
    <div className="min-h-screen bg-[#050507] font-sans text-slate-200 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
        
        {/* Left Side - Marketing / Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-col justify-center items-start space-y-8"
        >
          <div className="space-y-4">
             <div className="inline-block px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                🚀 Gestão Inteligente & Escalável
             </div>
             <h2 className="text-5xl font-extrabold text-white leading-tight">
               Potencialize seu negócio com a <br/>
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                 Kryon Systems
               </span>
             </h2>
             <p className="text-xl text-slate-400 leading-relaxed max-w-md">
               A plataforma definitiva para transformar a administração de qualquer setor com simplicidade e IA.
             </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
             {[
               { icon: 'target', label: 'Precisão' },
               { icon: 'speed', label: 'Agilidade' },
               { icon: 'security', label: 'Segurança' },
               { icon: 'analytics', label: 'Insights' }
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="material-symbols-outlined text-blue-400">{item.icon}</span>
                  <span className="text-sm font-medium text-slate-300">{item.label}</span>
               </div>
             ))}
          </div>
        </motion.div>

        {/* Right Side - Login Form (Glassmorphism Card) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 lg:p-10 rounded-[32px] shadow-2xl relative overflow-hidden group">
            {/* Subtle card glow */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            
            <div className="space-y-8">
              {/* Header / Logo Area */}
              <div className="text-center">
                  <Link href="/" className="inline-block mb-8 hover:scale-105 transition-transform">
                    <span className="text-3xl font-bold text-white">
                      Kryon <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Systems</span>
                    </span>
                  </Link>

                  <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
                  <p className="mt-2 text-slate-400 text-sm">
                      Sua porta de entrada para uma gestão inteligente.
                  </p>
              </div>

              {/* Notifications */}
              {isConfirmed && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-sm flex items-center gap-2">
                       <span className="material-symbols-outlined">check_circle</span>
                       <span>E-mail confirmado! Prossiga com o login.</span>
                  </motion.div>
              )}

              {isSignupSuccess && !isConfirmed && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm flex items-center gap-2">
                       <span className="material-symbols-outlined">mark_email_unread</span>
                       <span>Verifique seu e-mail para ativar sua conta.</span>
                  </motion.div>
              )}

              {errorMessage && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-200 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined">error</span>
                      <span>{errorMessage}</span>
                  </motion.div>
              )}

              {/* Form */}
              <form action={formAction} className="space-y-6">
                  <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-slate-400 ml-1">E-mail corporativo</label>
                      <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors material-symbols-outlined text-[20px]">mail</span>
                          <input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="exemplo@empresa.com"
                              required
                              autoComplete="email"
                              disabled={isPending}
                              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/20 border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-600 text-white disabled:opacity-50"
                          />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                          <label htmlFor="password" className="text-sm font-medium text-slate-400">Senha segura</label>
                          <Link 
                              href="/forgot-password" 
                              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                          >
                              Esqueceu?
                          </Link>
                      </div>
                      <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors material-symbols-outlined text-[20px]">lock</span>
                          <input
                              id="password"
                              name="password"
                              type="password"
                              placeholder="••••••••"
                              required
                              autoComplete="current-password"
                              disabled={isPending}
                              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/20 border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-600 text-white disabled:opacity-50"
                          />
                      </div>
                  </div>

                  <button 
                      type="submit" 
                      className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/40 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 flex items-center justify-center gap-3 group"
                      disabled={isPending}
                  >
                      {isPending ? (
                          <>
                             <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                             <span>Validando acesso...</span>
                          </>
                      ) : (
                          <>
                            Acessar Sistema
                            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                          </>
                      )}
                  </button>

                  <div className="pt-4 text-center">
                      <p className="text-sm text-slate-500">
                          Novo por aqui?{' '}
                          <Link href="/register" className="font-bold text-white hover:text-blue-400 transition-colors underline underline-offset-4 decoration-blue-500/30">
                              Criar conta agora
                          </Link>
                      </p>
                  </div>
              </form>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-6 text-[11px] text-slate-600 font-medium uppercase tracking-widest">
              <Link href="#" className="hover:text-slate-400 transition-colors">Termos</Link>
              <Link href="#" className="hover:text-slate-400 transition-colors">Privacidade</Link>
              <Link href="#" className="hover:text-slate-400 transition-colors">Suporte</Link>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050507] flex items-center justify-center text-slate-500">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
