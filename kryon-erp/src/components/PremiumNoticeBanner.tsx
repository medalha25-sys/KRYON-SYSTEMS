'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, CreditCard } from 'lucide-react'

interface PremiumNoticeBannerProps {
  status: 'active_trial' | 'expired_trial' | 'no_access' | 'active_subscription' | 'grace_period' | 'expired_subscription' | 'free_tier'
  daysLeft: number
  onUpgrade: () => void
}

export default function PremiumNoticeBanner({ status, daysLeft, onUpgrade }: PremiumNoticeBannerProps) {
  if (status === 'no_access' || status === 'active_subscription') return null

  if (status === 'active_trial') {
    if (daysLeft > 5) return null
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-3 rounded-xl text-sm flex items-center justify-between mb-6 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-emerald-600" />
          <span>
            <strong>Período Premium:</strong> Você tem {daysLeft} dias restantes de teste grátis. Aproveite todos os recursos!
          </span>
        </div>
        <button 
          onClick={onUpgrade}
          className="text-emerald-700 font-semibold hover:text-emerald-900 underline text-xs"
        >
          Assinar Agora
        </button>
      </motion.div>
    )
  }

  if (status === 'grace_period') {
     return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-3 rounded-xl text-sm flex items-center justify-between mb-6 shadow-sm ring-1 ring-amber-300"
      >
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-amber-600" />
          <span>
            <strong>Atenção:</strong> Seu pagamento está pendente. Você tem {daysLeft} dias de tolerância antes do bloqueio.
          </span>
        </div>
        <button 
          onClick={onUpgrade}
          className="text-amber-700 font-semibold hover:text-amber-900 underline text-xs bg-amber-100 px-3 py-1 rounded"
        >
          Regularizar Pagamento
        </button>
      </motion.div>
    )
  }

  if (status === 'free_tier') {
      return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-100 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm flex items-center justify-between mb-6 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-gray-500" />
          <span>
            <strong>Plano Gratuito:</strong> Você está usando a versão limitada (max 20 pacientes).
          </span>
        </div>
        <button 
          onClick={onUpgrade}
          className="text-emerald-700 font-semibold hover:text-emerald-900 underline text-xs"
        >
          Desbloquear Ilimitado
        </button>
      </motion.div>
    )
  }

  if (status === 'expired_trial' || status === 'expired_subscription') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-white border-l-4 border-red-500 shadow-2xl p-6 rounded-lg max-w-sm z-50 flex flex-col gap-3"
      >
        <div className="flex items-center gap-3 text-red-600 font-bold text-lg">
          <AlertTriangle size={24} />
          <h3>{status === 'expired_trial' ? 'Período de Teste Expirado' : 'Assinatura Expirada'}</h3>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          Seu acesso aos recursos Premium foi encerrado. Assine agora para continuar gerenciando sua clínica com excelência.
        </p>
        <button 
          onClick={onUpgrade}
          className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition w-full shadow-md"
        >
          Liberar Acesso Premium
        </button>
      </motion.div>
    )
  }

  return null
}
