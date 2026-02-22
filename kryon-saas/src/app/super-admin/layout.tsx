import { redirect } from 'next/navigation'
import { checkSuperAdmin } from './actions'
import Link from 'next/link'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isSuper = await checkSuperAdmin()

  if (!isSuper) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Kryon Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">Super Admin Access</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/super-admin" className="block px-4 py-2 rounded hover:bg-slate-700 transition">
            Dashboard
          </Link>
          <Link href="/super-admin/clinics" className="block px-4 py-2 rounded hover:bg-slate-700 transition">
            Clínicas (Organizations)
          </Link>
          <Link href="/super-admin/users" className="block px-4 py-2 rounded hover:bg-slate-700 transition">
            Usuários
          </Link>
          <Link href="/super-admin/financial" className="block px-4 py-2 rounded hover:bg-slate-700 transition">
            Financeiro SaaS
          </Link>
          <Link href="/super-admin/logs" className="block px-4 py-2 rounded hover:bg-slate-700 transition">
            Audit Logs
          </Link>
          
          <div className="pt-4 mt-4 border-t border-slate-700">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 px-4">Módulos Ativos</p>
            <Link href="/concrete/dashboard" className="block px-4 py-2 rounded text-blue-400 hover:bg-slate-700 transition flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
              Concrete ERP
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-700">
            <Link href="/" className="block text-center text-sm text-slate-400 hover:text-white">
                Voltar ao App
            </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow-lg">
           <h2 className="font-semibold">Painel de Controle Mestre</h2>
           <div className="flex items-center gap-4">
              <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30">
                PROD ENVIRONMENT
              </span>
           </div>
        </header>
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  )
}
