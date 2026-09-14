import React from 'react'
import Link from 'next/link'
import { KryonAdminHeader } from './KryonAdminHeader'
import { Construction, Sparkles, ArrowLeft } from 'lucide-react'

interface KryonAdminPlaceholderProps {
  title: string
  description: string
  moduleName: string
  expectedFeatures: string[]
}

export function KryonAdminPlaceholderPage({
  title,
  description,
  moduleName,
  expectedFeatures
}: KryonAdminPlaceholderProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <KryonAdminHeader
        title={title}
        subtitle={description}
      />

      <div className="p-8 sm:p-12 rounded-3xl bg-[#0B0F19] border border-white/[0.08] text-center space-y-6 max-w-3xl mx-auto shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto shadow-lg shadow-blue-500/10">
          <Construction size={32} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase">
            <Sparkles size={12} />
            Módulo em Estruturação Visual
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{moduleName}</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            A estrutura de navegação está pronta e preparada para receber os controles e formulários executivos na próxima etapa.
          </p>
        </div>

        {expectedFeatures.length > 0 && (
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-left space-y-3">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Recursos planejados para este módulo:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
              {expectedFeatures.map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2">
          <Link
            href="/kryon-admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition"
          >
            <ArrowLeft size={14} />
            <span>Voltar para a Visão Geral</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
