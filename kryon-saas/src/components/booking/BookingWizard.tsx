'use client'

import React, { useState, useEffect } from 'react'
import { format, addDays, startOfToday, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
}

interface Organization {
  id: string
  name: string
  slug: string
  primary_color?: string
  secondary_color?: string
}

interface Professional {
    id: string
    name: string
    public_booking_enabled: boolean
}

interface BookingWizardProps {
  organization: Organization
  services: Service[]
}

type Step = 'service' | 'professional' | 'datetime' | 'client' | 'success'

export default function BookingWizard({ organization, services }: BookingWizardProps) {
  const [step, setStep] = useState<Step>('service')
  
  // Selection State
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  // Data State
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  
  // Client Form
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Select Service
  const handleSelectService = (service: Service) => {
    setSelectedService(service)
    setStep('professional')
  }

  // Step 2: Select Professional (Fetch slots immediately to get professionals?)
  // Actually, availability endpoint returns professionals too.
  // But we need to know who offers the service? 
  // Schema: `agenda_professionals` -> `agenda_services` link?
  // Current schema lacks direct link (many-to-many).
  // Implicitly: All professionals in org can perform all services?
  // Or: fetch availability for "today" to get professionals list?
  // Let's assume all active professionals in org are options for now.

  useEffect(() => {
    if (step === 'professional') {
        // Fetch professionals or use availability to find them?
        // Let's use the availability endpoint to discover professionals who have slots for this service?
        // Or just list all?
        // Let's fetch availability for TODAY to get the list of professionals returned by API.
        const fetchProfs = async () => {
             try {
                const params = new URLSearchParams({
                    slug: organization.slug,
                    date: format(new Date(), 'yyyy-MM-dd'),
                    serviceId: selectedService?.id || ''
                })
                const res = await fetch(`/api/public/booking/availability?${params}`)
                const data = await res.json()
                if (data.professionals) {
                    setProfessionals(data.professionals)
                }
             } catch (e) {
                 console.error(e)
             }
        }
        fetchProfs()
    }
  }, [step, selectedService, organization.slug])

  const handleSelectProfessional = (prof: Professional) => {
    setSelectedProfessional(prof)
    setStep('datetime')
  }

  // Step 3: Date & Time
  // Fetch slots when Date changes (or initial load of step)
  useEffect(() => {
    const fetchSlots = async () => {
        if (step !== 'datetime' || !selectedService || !selectedProfessional) return
        
        setLoadingSlots(true)
        setAvailableSlots([])
        
        try {
            const params = new URLSearchParams({
                slug: organization.slug,
                date: format(selectedDate, 'yyyy-MM-dd'),
                serviceId: selectedService.id,
                professionalId: selectedProfessional.id
            })
            
            const res = await fetch(`/api/public/booking/availability?${params}`)
            if (res.ok) {
                const data = await res.json()
                // data.slots is { "HH:mm": [profId] }
                // We just need the keys since we selected a specific professional
                const times = Object.keys(data.slots).sort()
                setAvailableSlots(times)
            }
        } catch (error) {
            console.error(error)
            toast.error('Erro ao buscar horários')
        } finally {
            setLoadingSlots(false)
        }
    }
    
    fetchSlots()
  }, [step, selectedDate, selectedService, selectedProfessional, organization.slug])

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep('client')
  }

  // Step 4: Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
        const res = await fetch('/api/public/booking/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slug: organization.slug,
                serviceId: selectedService?.id,
                professionalId: selectedProfessional?.id,
                date: format(selectedDate, 'yyyy-MM-dd'),
                time: selectedTime,
                clientName,
                clientPhone,
                clientEmail
            })
        })

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Erro ao agendar')
        }

        setStep('success')
        toast.success('Agendamento solicitado com sucesso!')
    } catch (error: any) {
        toast.error(error.message)
    } finally {
        setIsSubmitting(false)
    }
  }

  // Renders
  if (step === 'service') {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Selecione o Serviço</h3>
            <div className="grid gap-3">
                {services.map(service => (
                    <button
                        key={service.id}
                        onClick={() => handleSelectService(service)}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-left flex justify-between items-center group"
                    >
                        <div>
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition">{service.name}</div>
                            <div className="text-sm text-gray-500">{service.duration_minutes} min</div>
                        </div>
                        <div className="font-semibold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
  }

  if (step === 'professional') {
      return (
          <div className="space-y-4">
              <button onClick={() => setStep('service')} className="text-sm text-gray-500 hover:underline mb-2">← Voltar</button>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Escolha o Profissional</h3>
              <div className="grid gap-3">
                  {professionals.map(prof => (
                      <button
                          key={prof.id}
                          onClick={() => handleSelectProfessional(prof)}
                          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-left"
                      >
                          <div className="font-medium text-gray-900">{prof.name}</div>
                      </button>
                  ))}
                  {professionals.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                          Carregando profissionais...
                      </div>
                  )}
              </div>
          </div>
      )
  }

  if (step === 'datetime') {
      const days = []
      for (let i = 0; i < 5; i++) {
          days.push(addDays(new Date(), i))
      }

      return (
          <div className="space-y-4">
              <button onClick={() => setStep('professional')} className="text-sm text-gray-500 hover:underline mb-2">← Voltar</button>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Data e Horário</h3>
              
              {/* Date Picker (Simple Horizontal List) */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                  {days.map(day => {
                      const isSelected = isSameDay(day, selectedDate)
                      const primaryColor = organization.primary_color || '#2563eb'
                      return (
                          <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(day)}
                            className={`flex flex-col items-center min-w-[4rem] p-2 rounded-lg border transition ${isSelected ? 'text-white' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                            style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                          >
                              <span className="text-xs uppercase">{format(day, 'EEE', { locale: ptBR })}</span>
                              <span className="text-lg font-bold">{format(day, 'd')}</span>
                          </button>
                      )
                  })}
              </div>

              {/* Slots Grid */}
              <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Horários Disponíveis em {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}</h4>
                  {loadingSlots ? (
                      <div className="text-center py-8 text-gray-500">Buscando horários...</div>
                  ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableSlots.map(time => {
                              const isSelected = selectedTime === time
                              const primaryColor = organization.primary_color || '#2563eb'
                              return (
                              <button
                                key={time}
                                onClick={() => handleTimeSelect(time)}
                                className={`px-3 py-2 text-sm font-medium rounded border transition ${isSelected ? 'text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100'}`}
                                style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : { color: primaryColor, borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}10` }}
                              >
                                  {time}
                              </button>
                              )
                          })}
                      </div>
                  ) : (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                          Nenhum horário disponível nesta data.
                      </div>
                  )}
              </div>
          </div>
      )
  }

  if (step === 'client') {
      return (
          <div className="space-y-4">
              <button onClick={() => setStep('datetime')} className="text-sm text-gray-500 hover:underline mb-2">← Voltar</button>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Seus Dados</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 mb-4">
                  <p><strong className="text-gray-900">Serviço:</strong> {selectedService?.name}</p>
                  <p><strong className="text-gray-900">Profissional:</strong> {selectedProfessional?.name}</p>
                  <p><strong className="text-gray-900">Data:</strong> {format(selectedDate, "d 'de' MMMM", { locale: ptBR })} às {selectedTime}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                      <input 
                        type="text" 
                        required 
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp)</label>
                      <input 
                        type="tel" 
                        required 
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="(00) 00000-0000"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    style={{ backgroundColor: organization.primary_color || '#2563eb' }}
                  >
                      {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                  </button>
              </form>
          </div>
      )
  }

  if (step === 'success') {
      return (
          <div className="text-center py-12">
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Solicitado!</h2>
              <p className="text-gray-600 mb-8">
                  Recebemos seu pedido de agendamento. Em breve entraremos em contato para confirmar.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                  Novo Agendamento
              </button>
          </div>
      )
  }

  return null
}
