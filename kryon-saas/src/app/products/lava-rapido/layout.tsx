import Link from 'next/link'
import { Car, ClipboardList, Settings, Users, LayoutDashboard, Calendar, TrendingUp, DollarSign } from 'lucide-react'

export default function LavaRapidoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white font-sans">
      {/* Mini Sidebar */}
      <aside className="w-64 border-r border-gray-800 flex flex-col p-6 hidden md:flex">
        <div className="mb-8 px-2">
          <Link href="/products/lava-rapido" className="flex items-center gap-3">
            <div className="relative w-12 h-12 shrink-0">
              <img 
                src="/branding/logo_character.png" 
                alt="Papa Léguas" 
                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-black text-lg tracking-tighter text-blue-400 uppercase">Papa Léguas</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] -mt-0.5">Lava Rápido</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem href="/products/lava-rapido" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
          <SidebarItem href="/products/lava-rapido/agendamentos" icon={<Calendar className="w-5 h-5" />} label="Agendamentos" />
          <SidebarItem href="/products/lava-rapido/relatorios" icon={<TrendingUp className="w-5 h-5" />} label="Relatórios" />
          <SidebarItem href="/products/lava-rapido/vendas" icon={<ClipboardList className="w-5 h-5" />} label="Ordens de Serviço" />
          <SidebarItem href="/products/lava-rapido/financeiro" icon={<DollarSign className="w-5 h-5" />} label="Financeiro" />
          <SidebarItem href="/products/lava-rapido/clientes" icon={<Users className="w-5 h-5" />} label="Clientes / Veículos" />
          <SidebarItem href="/products/lava-rapido/servicos" icon={<Car className="w-5 h-5" />} label="Meus Serviços" />
          <SidebarItem href="/products/lava-rapido/settings" icon={<Settings className="w-5 h-5" />} label="Configurações" />
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-800 px-2">
           <Link href="/products" className="text-sm text-gray-500 hover:text-white transition">
            ← Voltar para Painel
           </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800 px-6 py-3 flex justify-between items-center z-50">
        <MobileNavItem href="/products/lava-rapido" icon={<LayoutDashboard className="w-6 h-6" />} label="Home" />
        <MobileNavItem href="/products/lava-rapido/agendamentos" icon={<Calendar className="w-6 h-6" />} label="Agenda" />
        <MobileNavItem href="/products/lava-rapido/financeiro" icon={<DollarSign className="w-6 h-6" />} label="Grana" />
        <MobileNavItem href="/products/lava-rapido/relatorios" icon={<TrendingUp className="w-6 h-6" />} label="Relatórios" />
        <MobileNavItem href="/products/lava-rapido/vendas" icon={<ClipboardList className="w-6 h-6" />} label="OS" />
        <MobileNavItem href="/products/lava-rapido/settings" icon={<Settings className="w-6 h-6" />} label="Ajustes" />
      </nav>
    </div>
  )
}

function SidebarItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 transition-all group"
    >
      <span className="group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  )
}

function MobileNavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-400 transition-colors"
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </Link>
  )
}
