'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  ArrowLeft, 
  User, 
  Car, 
  Phone, 
  Hash, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Save,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function NewOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    vehicle_plate: '',
    vehicle_model: '',
    vehicle_size: 'M',
    service_id: '',
    price: 0,
  })

  // Mock Services (Would fetch from DB in real implementation)
  const services = [
    { id: '1', name: 'Lavagem Completa', price_p: 50, price_m: 70, price_g: 90 },
    { id: '2', name: 'Higienização Interna', price_p: 250, price_m: 300, price_g: 350 },
    { id: '3', name: 'Polimento Técnico', price_p: 400, price_m: 500, price_g: 650 },
  ]

  // Auto-update price when service or size changes
  useEffect(() => {
    const selectedService = services.find(s => s.id === formData.service_id)
    if (selectedService) {
      const priceKey = `price_${formData.vehicle_size.toLowerCase()}` as keyof typeof selectedService
      setFormData(prev => ({ ...prev, price: selectedService[priceKey] as number }))
    }
  }, [formData.service_id, formData.vehicle_size])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => router.push('/products/lava-rapido/vendas'), 2000)
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <Link 
          href="/products/lava-rapido/vendas"
          className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-1">Nova Ordem de Serviço</h1>
          <p className="text-gray-400">Registre os dados do veículo e cliente para iniciar a lavagem.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cliente & Veículo */}
          <section className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
               <User className="w-5 h-5 text-blue-400" />
               Dados do Cliente & Veículo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Nome do Cliente" icon={<User />}>
                <input 
                  required
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: João Silva" 
                  value={formData.client_name}
                  onChange={e => setFormData({...formData, client_name: e.target.value})}
                />
              </FormField>
              
              <FormField label="Telefone / WhatsApp" icon={<Phone />}>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="(00) 00000-0000" 
                  value={formData.client_phone}
                  onChange={e => setFormData({...formData, client_phone: e.target.value})}
                />
              </FormField>

              <FormField label="Placa do Veículo" icon={<Hash />}>
                <input 
                  required
                  type="text" 
                  className="form-input uppercase font-mono" 
                  placeholder="ABC-1234" 
                  value={formData.vehicle_plate}
                  onChange={e => setFormData({...formData, vehicle_plate: e.target.value.toUpperCase()})}
                />
              </FormField>

              <FormField label="Modelo / Cor" icon={<Car />}>
                <input 
                  required
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Honda Civic Prata" 
                  value={formData.vehicle_model}
                  onChange={e => setFormData({...formData, vehicle_model: e.target.value})}
                />
              </FormField>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3 text-center uppercase tracking-widest text-[10px]">Tamanho do Veículo</label>
              <div className="flex gap-4">
                {['P', 'M', 'G'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFormData({...formData, vehicle_size: size})}
                    className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all ${
                      formData.vehicle_size === size 
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                      : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-700'
                    }`}
                  >
                    {size === 'P' ? 'Pequeno' : size === 'M' ? 'Médio' : 'Grande'}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Serviço */}
          <section className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
               <CheckCircle2 className="w-5 h-5 text-green-400" />
               Seleção de Serviço
            </h2>

            <FormField label="Escolha o Serviço" icon={<Clock />}>
               <select 
                required
                className="form-input"
                value={formData.service_id}
                onChange={e => setFormData({...formData, service_id: e.target.value})}
               >
                 <option value="">Selecione um serviço...</option>
                 {services.map(s => (
                   <option key={s.id} value={s.id}>{s.name}</option>
                 ))}
               </select>
            </FormField>
          </section>
        </div>

        {/* Right Column: Checkout Summary */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 sticky top-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
               <DollarSign className="w-5 h-5 text-amber-400" />
               Resumo da OS
            </h3>

            <div className="space-y-4 mb-8">
               <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Veículo</span>
                  <span className="font-medium text-white">{formData.vehicle_plate || '---'}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tamanho</span>
                  <span className="font-medium text-white">{formData.vehicle_size}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Serviço</span>
                  <span className="font-medium text-white">
                    {services.find(s => s.id === formData.service_id)?.name || 'Nenhum'}
                  </span>
               </div>
            </div>

            <div className="pt-6 border-t border-gray-800 mb-8">
               <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Total</span>
                  <div className="text-right">
                    <span className="block text-sm text-gray-500 line-through decoration-red-500/50">
                       R$ {(formData.price * 1.1).toFixed(2)}
                    </span>
                    <span className="text-3xl font-black text-blue-400">R$ {formData.price.toFixed(2)}</span>
                  </div>
               </div>
            </div>

            <button 
              type="submit"
              disabled={loading || success || !formData.service_id}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {success ? 'OS Criada com Sucesso!' : 'Gerar Ordem de Serviço'}
            </button>
          </div>
        </div>
      </form>

      {/* Success Animation */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
          >
            <div className="bg-gray-900 border border-blue-500/30 p-12 rounded-[40px] shadow-2xl text-center space-y-4">
               <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-blue-500" />
               </div>
               <h2 className="text-3xl font-black italic uppercase tracking-tighter">OS Criada!</h2>
               <p className="text-gray-400 font-medium">Redirecionando para o painel...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .form-input {
          width: 100%;
          background-color: #030712;
          border: 1px solid #1f2937;
          border-radius: 12px;
          padding: 12px 16px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  )
}

function FormField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
        {icon && <span className="opacity-50">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  )
}
