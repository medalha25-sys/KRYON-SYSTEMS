'use client'

import { useActionState, useEffect, useState, Suspense } from 'react'
import { login } from './actions'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function LoginForm() {
  const searchParams = useSearchParams()
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
    { error: null }
  )
  const [initialMessage, setInitialMessage] = useState<string | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSignupSuccess, setIsSignupSuccess] = useState(false)

  useEffect(() => {
    setInitialMessage(searchParams.get('message'))
    setIsConfirmed(searchParams.get('confirmed') === '1')
    setIsSignupSuccess(searchParams.get('signup') === 'success')
  }, [searchParams])

  const errorMessage = state?.error || initialMessage

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-800">
      {/* Left Side - Marketing / Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-50 flex-col justify-center items-start p-12 relative overflow-hidden">
        {/* Placeholder for the large abstract image */}
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl mb-12 transform hover:scale-[1.02] transition-transform duration-500 bg-gradient-to-br from-blue-600 to-indigo-700">
             <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
             
             {/* Decorative circles */}
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
             <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>

        </div>

        <div className="max-w-md z-10">
          <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
            Potencialize sua gestão com a Kryon Systems.
          </h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            A solução completa para transformar a administração do seu negócio com inteligência e simplicidade.
          </p>
          

        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-white">
        <div className="w-full max-w-md space-y-8">
            {/* Header / Logo Area */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="w-full flex items-center justify-center">
                        <Image src="/logo-clinica.png" alt="Clínica Serena" width={300} height={120} className="object-contain h-32 md:h-40" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-slate-900">Bem-vindo de volta</h1>
                <p className="mt-2 text-slate-500">
                    Acesse sua conta para gerenciar seu negócio.
                </p>
            </div>

            {/* Notifications */}
            {isConfirmed && (
                <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm flex items-center gap-2">
                     <span className="material-symbols-outlined">check_circle</span>
                     <span>E-mail confirmado! Faça login para continuar.</span>
                </div>
            )}

            {isSignupSuccess && !isConfirmed && (
                <div className="p-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-sm flex items-center gap-2">
                     <span className="material-symbols-outlined">mark_email_unread</span>
                     <span>Cadastro realizado! Verifique seu e-mail.</span>
                </div>
            )}

            {errorMessage && (
                <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Form */}
            <form action={formAction} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">E-mail</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">mail</span>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="seu@email.com"
                            required
                            autoComplete="email"
                            disabled={isPending}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-800 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="text-sm font-medium text-slate-700">Senha</label>
                        <Link 
                            href="/forgot-password" 
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">lock</span>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Sua senha"
                            required
                            autoComplete="current-password"
                            disabled={isPending}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-800 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                           <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                           <span>Entrando...</span>
                        </>
                    ) : (
                        'Acessar Sistema'
                    )}
                </button>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-400 uppercase">Ou</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="text-center text-sm text-slate-500 mt-8">
                    Não tem uma conta?{' '}
                    <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                        Criar conta agora
                    </Link>
                </div>
            </form>

            <div className="pt-8 text-center text-xs text-slate-400 space-x-4">
                <Link href="#" className="hover:text-slate-600">Termos de Uso</Link>
                <Link href="#" className="hover:text-slate-600">Privacidade</Link>
                <Link href="#" className="hover:text-slate-600">Suporte</Link>
            </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-500">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
