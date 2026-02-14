'use client'

import React, { useState } from 'react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getAvailableSlots, createPublicAppointment } from '@/app/agendar/[slug]/actions'
import { toast } from 'sonner'

interface PublicBookingProps {
  tenant_id: string
  shop: any
  professionals: any[]
  services: any[]
}

export default function PublicBooking({ tenant_id, shop, professionals, services }: PublicBookingProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [clientData, setClientData] = useState({ name: '', phone: '', email: '' })
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Step 1: Select Service
  const handleServiceSelect = (service: any) => {
    setSelectedService(service)
    setStep(2)
  }

  // Step 2: Select Professional
  const handleProfessionalSelect = (pro: any) => {
    setSelectedProfessional(pro)
    setStep(3)
    // Pre-select today? Or wait for user to pick date
  }

  // Step 3: Select Date & Time
  // Simple date picker for next 14 days
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i))

  const handleDateSelect = async (dateStr: string) => {
      setSelectedDate(dateStr)
      setSelectedTime('')
      setLoadingSlots(true)
      const slots = await getAvailableSlots(tenant_id, selectedProfessional.id, selectedService.id, dateStr)
      setAvailableSlots(slots)
      setLoadingSlots(false)
  }

  const handleTimeSelect = (time: string) => {
      setSelectedTime(time)
      setStep(4)
  }

  // Step 4: Client Info
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      const res = await createPublicAppointment(tenant_id, {
          service_id: selectedService.id,
          professional_id: selectedProfessional.id,
          date: selectedDate,
          time: selectedTime,
          ...clientData
      })

      if (res.error) {
          toast.error(res.error)
      } else {
          setStep(5) // Success
      }
  }

  // Success Screen
  if (step === 5) {
      return (
          <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Agendamento Confirmado!</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Seu horário foi reservado com sucesso. Enviamos os detalhes para o seu WhatsApp/Email.
              </p>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-sm mx-auto text-left mb-8">
                  <p className="font-bold text-lg mb-2">{selectedService.name}</p>
                  <p className="text-gray-600 mb-1">{format(new Date(selectedDate), "d 'de' MMMM", { locale: ptBR })} às {selectedTime}</p>
                  <p className="text-gray-500 text-sm">{selectedProfessional.name}</p>
              </div>

              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                  Novo Agendamento
              </button>
          </div>
      )
  }

  return (
    <div className="w-full">
        {/* Progress Bar */}
        <div className="flex justify-between mb-8 px-2">
            {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-2 flex-1 mx-1 rounded-full ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            ))}
        </div>

        {/* content */}
        {step === 1 && (
            <div>
                <h3 className="text-xl font-bold mb-4">Selecione o Serviço</h3>
                <div className="space-y-3">
                    {services.map(s => (
                        <div 
                            key={s.id} 
                            onClick={() => handleServiceSelect(s)}
                            className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition flex justify-between items-center group"
                        >
                            <span className="font-medium">{s.name}</span>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-500 text-sm">{s.duration_minutes} min</span>
                                <span className="font-bold text-blue-600">R$ {s.price}</span>
                                <span className="material-symbols-outlined text-gray-300 group-hover:text-blue-500">chevron_right</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {step === 2 && (
             <div>
                <button onClick={() => setStep(1)} className="text-sm text-gray-500 mb-4 flex items-center hover:text-gray-800"><span className="material-symbols-outlined text-sm mr-1">arrow_back</span> Voltar</button>
                <h3 className="text-xl font-bold mb-4">Selecione o Profissional</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {professionals.map(p => (
                        <div 
                            key={p.id} 
                            onClick={() => handleProfessionalSelect(p)}
                            className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition text-center group"
                        >
                            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-gray-500">
                                {p.name[0]}
                            </div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.specialty}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {step === 3 && (
            <div>
                 <button onClick={() => setStep(2)} className="text-sm text-gray-500 mb-4 flex items-center hover:text-gray-800"><span className="material-symbols-outlined text-sm mr-1">arrow_back</span> Voltar</button>
                 <h3 className="text-xl font-bold mb-4">Escolha o Horário</h3>
                 
                 {/* Dates Carousel */}
                 <div className="flex overflow-x-auto gap-2 pb-4 mb-4 custom-scrollbar">
                     {dates.map(date => {
                         const dateStr = format(date, 'yyyy-MM-dd')
                         const isSelected = selectedDate === dateStr
                         const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr
                         
                         return (
                             <button
                                key={dateStr}
                                onClick={() => handleDateSelect(dateStr)}
                                className={`flex-shrink-0 w-16 p-2 rounded-lg border text-center transition ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:border-blue-400 border-gray-200'}`}
                             >
                                 <div className="text-xs opacity-80">{isToday ? 'Hoje' : format(date, 'EEE', { locale: ptBR })}</div>
                                 <div className="font-bold text-lg">{format(date, 'd')}</div>
                             </button>
                         )
                     })}
                 </div>

                 {/* Slots */}
                 {selectedDate && (
                     <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                         {loadingSlots ? (
                             <div className="col-span-full text-center py-8 text-gray-500">Carregando horários...</div>
                         ) : availableSlots.length > 0 ? (
                             availableSlots.map(time => (
                                 <button
                                    key={time}
                                    onClick={() => handleTimeSelect(time)}
                                    className="p-2 border rounded hover:bg-blue-50 hover:border-blue-500 transition text-sm font-medium"
                                 >
                                     {time}
                                 </button>
                             ))
                         ) : (
                             <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                 Nenhum horário disponível nesta data.
                             </div>
                         )}
                     </div>
                 )}
            </div>
        )}

        {step === 4 && (
            <div>
                 <button onClick={() => setStep(3)} className="text-sm text-gray-500 mb-4 flex items-center hover:text-gray-800"><span className="material-symbols-outlined text-sm mr-1">arrow_back</span> Voltar</button>
                 <h3 className="text-xl font-bold mb-4">Seus Dados</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium mb-1">Nome Completo</label>
                         <input 
                            required 
                            value={clientData.name}
                            onChange={e => setClientData({...clientData, name: e.target.value})}
                            className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                     </div>
                     <div>
                         <label className="block text-sm font-medium mb-1">Telefone (WhatsApp)</label>
                         <input 
                            required 
                            type="tel"
                            value={clientData.phone}
                            onChange={e => setClientData({...clientData, phone: e.target.value})}
                            className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                     </div>
                     <div>
                         <label className="block text-sm font-medium mb-1">Email (Opcional)</label>
                         <input 
                            type="email"
                            value={clientData.email}
                            onChange={e => setClientData({...clientData, email: e.target.value})}
                            className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                     </div>
                     
                     <div className="pt-4 border-t mt-6">
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <p className="font-bold text-blue-900 mb-1">Resumo do Agendamento</p>
                            <p className="text-sm text-blue-800">{selectedService?.name} com {selectedProfessional?.name}</p>
                            <p className="text-sm text-blue-800">{format(new Date(selectedDate), "d 'de' MMMM", { locale: ptBR })} às {selectedTime}</p>
                        </div>

                         <button 
                            type="submit"
                            className="w-full py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg transform active:scale-95"
                         >
                             Confirmar Agendamento
                         </button>
                     </div>
                 </form>
            </div>
        )}
    </div>
  )
}
