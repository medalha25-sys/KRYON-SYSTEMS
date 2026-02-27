import { cookies } from 'next/headers'
import { stopImpersonation } from '@/app/super-admin/actions'

export async function ImpersonationBanner() {
  const cookieStore = await cookies()
  const restoreCookie = cookieStore.get('admin-restore-session')

  if (!restoreCookie) return null

  return (
    <div className="bg-red-600 text-white text-center p-2 text-sm font-bold flex justify-center items-center gap-4 fixed top-0 w-full z-[9999] shadow-lg">
      <span>⚠️ MODO DE IMPERSONALIZAÇÃO ATIVO</span>
      <form action={stopImpersonation}>
        <button type="submit" className="bg-white text-red-600 px-3 py-1 rounded hover:bg-red-50 text-xs uppercase tracking-wider">
            Sair do Modo Cliente
        </button>
      </form>
    </div>
  )
}
