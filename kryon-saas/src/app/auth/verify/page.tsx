'use client'

import { verifyOtp } from '../../login/actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useTransition } from 'react'
import '../../login/login.css' // Reusing login styles for consistency

function VerifyContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const message = searchParams.get('message')
  
  const [otp, setOtp] = useState('')
  const [isPending, startTransition] = useTransition()
  
  return (
    <div className="loginContainer">
      <div className="loginCard animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="logoArea">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">mark_email_read</span>
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">
            Verifique seu E-mail
          </h1>
          <p className="max-w-[280px] mx-auto">
            Enviamos um código de confirmação para <br/>
            <span className="font-bold text-primary">{email}</span>
          </p>
        </div>

        {message && (
          <div className="errorMsg bg-red-50 text-red-500 p-4 rounded-xl border border-red-100 text-sm font-bold mb-6">
            {message}
          </div>
        )}

        <form action={(formData) => {
            // Append email from URL if not in form (though we use hidden input)
            if (!formData.get('email') && email) {
                formData.append('email', email)
            }
            // We can call server action directly
            verifyOtp(formData)
        }}>
          <input type="hidden" name="email" value={email || ''} />
          
          <div className="formGroup">
            <label htmlFor="otp" className="text-center block mb-2">Código de Verificação</label>
            <div className="inputWrapper">
              <input
                id="otp"
                name="token"
                type="text"
                placeholder="123456"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full h-14 px-4 bg-gray-50 border-2 border-transparent focus:border-primary rounded-xl outline-none transition-all font-black text-center text-2xl tracking-[0.5em]"
                autoComplete="one-time-code"
                autoFocus
              />
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
              Digite o código de 6 dígitos enviado
            </p>
          </div>

          <button 
            type="submit" 
            disabled={otp.length < 6}
            className="submitBtn w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 mt-4"
          >
            Confirmar
          </button>
          
          <div className="footerLinks mt-6 text-center text-sm text-gray-500">
            Não recebeu? 
            <button type="button" className="text-primary font-bold ml-1 hover:underline text-xs uppercase" onClick={() => alert('Funcionalidade de reenvio em breve!')}>
              Reenviar código
            </button>
          </div>
          
          <div className="mt-4 text-center">
             <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
               ← Voltar para Login
             </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
            <VerifyContent />
        </Suspense>
    )
}
