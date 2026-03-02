import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function SystemsPage() {
  const systems = [
    {
      id: 'concrete-erp',
      name: 'Concrete ERP',
      description: 'Sistema de gestão para indústrias de concreto e construção civil.',
      icon: 'factory',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      adminPath: '/concrete',
      active: true,
      stats: '15 Clientes Ativos'
    },
    {
      id: 'clinica-serena',
      name: 'Clínica Serena',
      description: 'Gestão completa para clínicas médicas e consultórios.',
      icon: 'medical_services',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      adminPath: '/app/dashboard',
      active: true,
      stats: '8 Clientes Ativos'
    },
    {
      id: 'loja-roupas',
      name: 'Loja de Roupas AI',
      description: 'Catálogo inteligente e gestão para lojas de moda.',
      icon: 'apparel',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      adminPath: '/fashion/dashboard',
      active: false,
      stats: 'Aguardando Lançamento'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Meus Sistemas (SaaS)</h1>
        <p className="text-slate-400">Gerencie e acesse todos os módulos da plataforma Kryon.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {systems.map((system) => (
          <div key={system.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-6 flex flex-col shadow-xl transition hover:border-slate-500 group">
            <div className={`w-14 h-14 ${system.bgColor} rounded-xl flex items-center justify-center mb-4 transition group-hover:scale-110`}>
              <span className={`material-symbols-outlined text-3xl ${system.color}`}>
                {system.icon}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">{system.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${system.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'}`}>
                  {system.active ? 'Ativo' : 'Offline'}
                </span>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                {system.description}
              </p>
              <div className="text-xs font-medium text-slate-500 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                {system.stats}
              </div>
            </div>

            <div className="space-y-3">
              <Link 
                href={system.adminPath}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition"
              >
                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                Acessar como Admin
              </Link>
              <button 
                className="w-full py-2.5 border border-slate-700 hover:bg-slate-700/50 text-slate-300 rounded-lg font-medium text-sm transition"
              >
                Configurações do Módulo
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Novo Sistema no Horizonte?</h3>
          <p className="text-slate-400 max-w-lg">
            A arquitetura da Kryon permite plugar novos módulos rapidamente. Clique em expandir para ver o roadmap.
          </p>
        </div>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap">
          <span className="material-symbols-outlined">add_circle</span>
          Cadastrar Novo SaaS
        </button>
      </div>
    </div>
  )
}
