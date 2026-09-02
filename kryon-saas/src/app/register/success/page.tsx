import Link from 'next/link'
import { CheckCircle2, Sparkles } from 'lucide-react'

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
      {/* Confetti / Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 lg:p-14 rounded-[32px] shadow-2xl relative z-10 max-w-lg w-full text-center space-y-8 animate-in zoom-in duration-500">
        
        {/* Animated Check */}
        <div className="flex justify-center relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-900/50 relative z-10">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-white flex items-center justify-center gap-3">
            <Sparkles className="text-yellow-400 w-8 h-8" />
            Parabéns!
            <Sparkles className="text-yellow-400 w-8 h-8" />
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Sua conta na <span className="font-bold text-white">Kryon Systems</span> foi criada com sucesso. Seu período de teste de 30 dias grátis já está ativo!
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/select-system" 
            className="inline-block w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/40 transition-all hover:-translate-y-1 active:scale-95 text-lg"
          >
            Acessar Meu Painel
          </Link>
        </div>
        
      </div>
    </div>
  )
}
