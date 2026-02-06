import { signup } from '../login/actions'
import '../login/login.css'
import Link from 'next/link'

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { message?: string, shop_id?: string, role?: string, email?: string }
}) {
  const shopId = searchParams?.shop_id;
  const role = searchParams?.role;
  const defaultEmail = searchParams?.email || '';

  return (
    <div className="loginContainer">
      <div className="loginCard animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="logoArea">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">add_moderator</span>
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">
            {shopId ? 'Juntar-se à Equipe' : 'Criar Nova Conta'}
          </h1>
          <p>{shopId ? 'Você foi convidado para colaborar' : 'Loja de Celulares | Kryon Systems'}</p>
        </div>

        {searchParams?.message && (
          <div className="errorMsg bg-red-50 text-red-500 p-4 rounded-xl border border-red-100 text-sm font-bold mb-6">
            {searchParams.message}
          </div>
        )}

        <form action={signup}>
          {/* Hidden fields for invitation meta-data */}
          <input type="hidden" name="shop_id" value={shopId || ''} />
          <input type="hidden" name="role" value={role || 'admin'} />

          <div className="formGroup">
            <label htmlFor="email">E-mail</label>
            <div className="inputWrapper">
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={defaultEmail}
                placeholder="seu@email.com"
                required
                className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-primary rounded-xl outline-none transition-all font-bold"
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
                className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-primary rounded-xl outline-none transition-all font-bold"
              />
            </div>
          </div>

          <button type="submit" className="submitBtn w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20">
            Finalizar Cadastro
          </button>
          
          <div className="footerLinks mt-6 text-center text-sm text-gray-500">
            Já tem uma conta? 
            <Link href="/login" className="text-primary font-bold ml-1">
              Entrar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
