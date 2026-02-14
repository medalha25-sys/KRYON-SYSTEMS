'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminSidebarProps {
  userEmail: string | undefined
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()

  const links = [
    { href: '/admin/finance', label: 'Financeiro', icon: 'payments' },
    { href: '/admin/users', label: 'Usuários', icon: 'group' },
    { href: '/admin/settings', label: 'Configurações', icon: 'settings' },
  ]

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">Kryon Admin</h1>
        <span className="text-xs text-slate-400">Super User</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname?.startsWith(link.href)
          
          return (
            <Link 
              key={link.href}
              href={link.href} 
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
            {userEmail?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate text-slate-300">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
