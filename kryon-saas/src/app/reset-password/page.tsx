'use client'

import { useActionState, Suspense } from 'react'
import { resetPassword } from './actions'
import Link from 'next/link'
import '../login/login.css'

function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await resetPassword(formData)
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
        <h1>NOVA SENHA</h1>
        <p>Defina sua nova senha de acesso</p>
      </div>

      {state.error && (
        <div className="errorMsg">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm">
          <strong>Sucesso!</strong> {state.success}
          <div className="mt-4">
            <Link href="/login" className="font-bold underline">
              Fazer Login agora
            </Link>
          </div>
        </div>
      )}

      {!state.success && (
        <form action={formAction} className="loginForm">
          <div className="formGroup">
            <label htmlFor="password">Nova Senha</label>
            <div className="inputWrapper">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={isPending}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submitBtn"
            disabled={isPending}
          >
            {isPending ? 'ATUALIZANDO...' : 'Redefinir Senha'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="loginContainer">
      <Suspense fallback={<div className="loginCard"><p className="text-white text-center">Carregando...</p></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
