'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Calendar, Clock, Phone, User, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { createLavaRapidoBooking, getAvailableLavaRapidoTimes } from '@/app/agendar-lavagem/[slug]/actions'

export default function LavaRapidoPublicBooking({ 
  tenant_id, 
  shop, 
  services 
}: { 
  tenant_id: string, 
  shop: any, 
  services: any[] 
}) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    vehicle_plate: '',
    vehicle_size: 'small' as 'small' | 'medium' | 'large',
    service_id: '',
    booking_date: '',
    start_time: '',
  })

  // Phase 3: Dynamic Time Slots
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [isFetchingTimes, setIsFetchingTimes] = useState(false)

  const allTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  useEffect(() => {
    async function loadAvailableTimes() {
      if (!formData.booking_date) return
      
      setIsFetchingTimes(true)
      const bookedTimes = await getAvailableLavaRapidoTimes(tenant_id, formData.booking_date)
      
      const freeTimes = allTimeSlots.filter((time) => !bookedTimes.includes(time))
      setAvailableTimes(freeTimes)
      setIsFetchingTimes(false)
    }

    loadAvailableTimes()
  }, [formData.booking_date, tenant_id])

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleServiceSelect = (id: string) => {
    setFormData({ ...formData, service_id: id })
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await createLavaRapidoBooking({
      ...formData,
      tenant_id
    })

    setLoading(false)
    if (result.success) {
      setSuccess(true)
    } else {
      alert(result.error)
    }
  }

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Agendamento Confirmado!</h2>
        <p className="text-gray-400 mb-8">Recebemos sua reserva. Entraremos em contato via WhatsApp para confirmar.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/30"
        >
          Voltar
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-500' : 'bg-gray-800'}`} 
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold mb-1">Qual o serviço?</h3>
              <p className="text-gray-400 text-sm">Escolha a lavagem ideal para seu veículo.</p>
            </div>
            
            <div className="grid gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className={`p-4 rounded-2xl border text-left transition-all hover:border-blue-500/50 hover:bg-gray-900/50 group ${formData.service_id === service.id ? 'border-blue-500 bg-blue-500/5' : 'border-gray-800 bg-gray-950'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold group-hover:text-blue-400 transition">{service.name}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{service.description}</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${formData.service_id === service.id ? 'text-blue-500' : 'text-gray-700'}`} />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold mb-1">Data e Porte</h3>
              <p className="text-gray-400 text-sm">Quando você deseja vir e qual o tamanho do carro?</p>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-3 block text-center">Tamanho do Veículo</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({...formData, vehicle_size: size as any})}
                        className={`py-3 rounded-2xl border-2 text-xs font-bold transition-all ${formData.vehicle_size === size ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-gray-950 border-gray-800 text-gray-400'}`}
                      >
                        {size === 'small' ? 'Pequeno' : size === 'medium' ? 'Médio' : 'Grande'}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-gray-800/50">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Selecione a Data</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="date" 
                        name="booking_date"
                        required
                        value={formData.booking_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-blue-500 outline-none" 
                      />
                    </div>
                  </div>

                  {formData.booking_date && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Horários Disponíveis
                      </label>
                      
                      {isFetchingTimes ? (
                        <div className="flex items-center gap-2 text-blue-400 text-sm animate-pulse">
                           <Loader2 className="w-4 h-4 animate-spin" />
                           Buscando horários...
                        </div>
                      ) : availableTimes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {availableTimes.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setFormData({...formData, start_time: time})}
                              className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                formData.start_time === time
                                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                                  : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-red-400 italic">Nenhum horário disponível para esta data.</p>
                      )}
                    </div>
                  )}
               </div>
            </div>

            <button 
              onClick={() => setStep(3)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 group transition-all mt-4"
            >
              Continuar
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setStep(1)} className="w-full text-xs text-gray-500 hover:text-white transition">← Mudar serviço</button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold mb-1">Seus Dados</h3>
              <p className="text-gray-400 text-sm">Para onde enviamos a confirmação?</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    name="customer_name"
                    placeholder="Como devemos te chamar?"
                    required
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-blue-500 outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    name="customer_phone"
                    placeholder="(00) 00000-0000"
                    required
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-blue-500 outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Placa do Carro (Opcional)</label>
                <div className="relative">
                  <Car className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    name="vehicle_plate"
                    placeholder="ABC-1234"
                    value={formData.vehicle_plate}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-blue-500 outline-none" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 group transition-all mt-4 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar Agendamento'}
              </button>
              <button type="button" onClick={() => setStep(2)} className="w-full text-xs text-gray-500 hover:text-white transition text-center block">← Voltar</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
