'use client'

import React from 'react'
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Shield, 
  Bell, 
  Smartphone,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function ConfigPage() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 pb-24">
      <header className="mb-10 pt-4 px-2">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Opções</h1>
        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Gerencie sua conta e sistema</p>
      </header>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[2rem] flex items-center justify-between group active:scale-[0.98] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center font-black text-black text-xl">
              U
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Usuário Ativo</h3>
              <p className="text-neutral-500 text-xs">Acessar perfil completo</p>
            </div>
          </div>
          <ChevronRight className="text-neutral-700 group-hover:text-white transition-colors" />
        </div>

        {/* Settings Links */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 px-4 mb-4">Preferências</h2>
          
          <ConfigLink icon={<Bell className="text-blue-500" />} label="Notificações" sub="Alertas de entrega e pedidos" />
          <ConfigLink icon={<Shield className="text-emerald-500" />} label="Privacidade" sub="Segurança e permissões" />
          <ConfigLink icon={<Smartphone className="text-purple-500" />} label="Configurar App" sub="Opções do modo PWA" />
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 px-4 mb-4">Suporte</h2>
          
          <ConfigLink icon={<HelpCircle className="text-orange-500" />} label="Ajuda e FAQ" sub="Dúvidas frequentes" />
          <div className="h-[1px] w-full bg-neutral-900 my-4"></div>
          
          <button 
            onClick={handleSignOut}
            className="w-full bg-red-500/10 border border-red-500/20 p-6 rounded-[1.5rem] flex items-center justify-between group active:bg-red-500/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <LogOut className="text-red-500 w-5 h-5" />
              </div>
              <span className="font-bold text-red-500">Sair do Aplicativo</span>
            </div>
            <ChevronRight className="text-red-500/40" />
          </button>
        </section>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-[10px] text-neutral-700 font-black uppercase tracking-[0.2em]">Concrete Kryon Systems v2.0</p>
      </footer>
    </div>
  )
}

function ConfigLink({ icon, label, sub }: any) {
  return (
    <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-[1.5rem] flex items-center justify-between group hover:border-neutral-700 active:bg-neutral-900/60 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-neutral-900 rounded-xl group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-sm">{label}</h4>
          <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">{sub}</p>
        </div>
      </div>
      <ChevronRight className="text-neutral-800 group-hover:text-neutral-500 transition-all" />
    </div>
  )
}
