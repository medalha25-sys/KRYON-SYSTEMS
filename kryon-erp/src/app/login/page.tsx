'use client'

import { useActionState, useEffect, Suspense } from 'react'
import { loginConcrete } from './actions'
import Image from 'next/image'

function ConcreteLoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await loginConcrete(prevState, formData)
      if (result?.success && result?.redirect) {
        // Redirection should be to /dashboard in the new app context
        window.location.href = result.redirect
        return { success: true, message: 'Autenticado! Carregando sistema industrial...' }
      }
      return { error: result?.error || null }
    },
    { error: null }
  )

  const errorMessage = state?.error

  return (
    <div className="flex min-h-screen bg-[#0F172A] font-sans text-slate-200">
      {/* Visual Identity Side */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-center items-center p-12 relative overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="relative z-10 text-center space-y-8 max-w-lg">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 mx-auto transform -rotate-6">
             <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
             </svg>
          </div>
          
          <h2 className="text-5xl font-extrabold tracking-tight text-white leading-tight">
            Concrete ERP <span className="text-blue-500">Brasil</span>
          </h2>
          <p className="text-xl text-slate-400 leading-relaxed font-light">
            Módulo Industrial e Logístico de Alta Performance.
            Gestão de usinas, frotas e automação de pedidos.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Login Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-[#0F172A]">
        <div className="w-full max-w-md space-y-12">
          <div className="flex flex-col items-center lg:items-start space-y-4">
             <h1 className="text-3xl font-bold text-white tracking-tight">Acesso Industrial</h1>
             <p className="text-slate-500">Insira suas credenciais para gerenciar a usina.</p>
          </div>

          {errorMessage && (
            <div className={`p-5 rounded-2xl border text-sm flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${
              errorMessage === 'NO_CONCRETE_SUBSCRIPTION' 
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
              : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}>
              <div>
                <p className="font-bold mb-1">
                  {errorMessage === 'NO_CONCRETE_SUBSCRIPTION' ? 'Assinatura Necessária' : 'Falha na Autenticação'}
                </p>
                <p className="opacity-80">
                  {errorMessage === 'NO_CONCRETE_SUBSCRIPTION' 
                    ? 'Sua organização não possui uma assinatura ativa para o Concrete ERP. Entre em contato com o administrador.' 
                    : errorMessage
                  }
                </p>
              </div>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">E-mail</label>
              <input
                name="email"
                type="email"
                placeholder="Seu e-mail corporativo"
                required
                disabled={isPending}
                className="w-full bg-[#1E293B] border border-slate-800 rounded-2xl py-4 px-4 text-white placeholder:text-slate-600 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Senha</label>
              <input
                name="password"
                type="password"
                placeholder="Sua senha"
                required
                disabled={isPending}
                className="w-full bg-[#1E293B] border border-slate-800 rounded-2xl py-4 px-4 text-white placeholder:text-slate-600 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all disabled:opacity-50"
            >
              {isPending ? 'Entrando...' : 'Acessar ERP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ConcreteLoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ConcreteLoginForm />
    </Suspense>
  )
}
