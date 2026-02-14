'use client'

import { useActionState, Suspense } from 'react'
import { forgotPassword } from './actions'
import Link from 'next/link'
import '../login/login.css'

function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await forgotPassword(formData)
      return { 
        error: result?.error || null,
        success: result?.success || null 
      }
    },
    { error: null, success: null }
  )

  return (
    <div className="loginCard">
      <div className="logoArea">
        <h1>RECUPERAR SENHA</h1>
        <p>Digite seu e-mail para receber o link de redefinição</p>
      </div>

      {state.error && (
        <div className="errorMsg">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm">
          {state.success}
        </div>
      )}

      {!state.success && (
        <form action={formAction} className="loginForm">
          <div className="formGroup">
            <label htmlFor="email">E-mail</label>
            <div className="inputWrapper">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submitBtn"
            disabled={isPending}
          >
            {isPending ? 'ENVIANDO...' : 'Enviar Link de Recuperação'}
          </button>
        </form>
      )}

      <div className="footerLinks mt-6">
        Lembrou a senha? 
        <Link href="/login">
          Voltar para o Login
        </Link>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <div className="loginContainer">
      <Suspense fallback={<div className="loginCard"><p className="text-white text-center">Carregando...</p></div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  )
}
