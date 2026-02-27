'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Star } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('annual')
  const [loading, setLoading] = React.useState(false)

  if (!isOpen) return null

  const handleUpgrade = async () => {
    setLoading(true)
    try {
        const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planType: billingCycle })
        })
        const data = await response.json()
        if (data.init_point) {
            window.location.href = data.init_point
        } else {
            alert('Erro ao iniciar pagamento.')
        }
    } catch (error) {
        console.error(error)
        alert('Erro de conexão.')
    } finally {
        setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        <motion.div
          className="bg-white rounded-3xl p-0 max-w-2xl w-full relative shadow-2xl overflow-hidden flex flex-col md:flex-row"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, type: 'spring' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/40 hover:bg-white/60 transition text-gray-800 z-10"
          >
            <X size={20} />
          </button>
          
          {/* Left Side: Visual & Value */}
          <div className="bg-emerald-600 p-8 md:w-2/5 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="text-yellow-300 fill-yellow-300" size={24} />
                <span className="font-bold tracking-wide uppercase text-xs">Premium</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Eleve sua prática clínica</h2>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Desbloqueie todo o potencial do Agenda Fácil e tenha controle total do seu consultório.
              </p>
            </div>
            
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-emerald-300" />
                <span>Prontuário Ilimitado</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-emerald-300" />
                <span>Gestão Financeira</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-emerald-300" />
                <span>Suporte Prioritário</span>
              </div>
            </div>
          </div>

          {/* Right Side: Action */}
          <div className="p-8 md:w-3/5 bg-white flex flex-col justify-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Plano Profissional</h3>
            
            {/* Toggle */}
            <div className="flex items-center gap-3 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                <button 
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1 text-sm rounded-md transition ${billingCycle === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Mensal
                </button>
                <button 
                    onClick={() => setBillingCycle('annual')}
                    className={`px-3 py-1 text-sm rounded-md transition ${billingCycle === 'annual' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Anual (-20%)
                </button>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-gray-900">
                {billingCycle === 'monthly' ? 'R$ 97' : 'R$ 970'}
              </span>
              <span className="text-gray-500">
                {billingCycle === 'monthly' ? '/mês' : '/ano'}
              </span>
            </div>
            
            <button 
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : 'Fazer Upgrade Agora'}
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-4">
              Cancelamento a qualquer momento. Garantia de 7 dias.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
