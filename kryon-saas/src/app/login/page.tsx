import { login, signup } from './actions'
import Link from 'next/link'
import './login.css'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  return (
    <div className="loginContainer">
      <div className="loginCard">
        <div className="logoArea">
          <h1>LOJA DE CELULARES</h1>
          <p>Kryon Systems Platform</p>
        </div>

        {searchParams?.message && (
          <div className="errorMsg">
            {searchParams.message}
          </div>
        )}

        <form>
          <div className="formGroup">
            <label htmlFor="email">E-mail</label>
            <div className="inputWrapper">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="formGroup">
            <label htmlFor="password">Senha</label>
            <div className="inputWrapper">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button formAction={login} className="submitBtn">
            Entrar
          </button>
          
          <div className="footerLinks">
            Não tem uma conta? 
            <Link href="/register">
              Cadastre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
