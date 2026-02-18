'use client'

import React, { useState } from 'react'
import { Client, Professional, Service, Appointment } from '@/types/agenda'
import { createAppointment, updateAppointment, cancelAppointment, completeAppointment } from '@/app/products/agenda-facil/actions'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

interface NewAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  clients: Client[]
  services: Service[]
  professionals: (Professional & { default_session_price?: number })[]
  initialDate?: Date
  initialTime?: string // HH:mm
  initialProfessionalId?: string
  appointment?: Appointment
}

export default function NewAppointmentModal({
  isOpen,
  onClose,
  clients,
  services,
  professionals,
  initialDate,
  initialTime,
  initialProfessionalId,
  appointment
}: NewAppointmentModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  // Derived state from appointment if exists
  const isEditing = !!appointment
  
  const defaultDateValue = appointment 
      ? appointment.start_time.split('T')[0] 
      : (initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])

  const defaultTimeValue = appointment
      ? format(parseISO(appointment.start_time), 'HH:mm')
      : (initialTime || '09:00')

  const defaultProfessionalId = appointment
      ? appointment.professional_id
      : (initialProfessionalId || '')

  const defaultClientId = appointment?.client_id || ''
  const defaultServiceId = appointment?.service_id || ''
  const defaultSessionPrice = appointment?.session_price || ''

  // State for session price to allow auto-update when professional changes
  const [sessionPrice, setSessionPrice] = useState<string | number>(defaultSessionPrice)
  const [selectedProfessionalId, setSelectedProfessionalId] = useState(defaultProfessionalId)

  // Update price when professional changes (only if not editing an existing specific price, or if user wants to reset? 
  // tailored logic: if new appointment, auto-fill. If editing, keep existing unless changed?)
  const handleProfessionalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const profId = e.target.value
      setSelectedProfessionalId(profId)
      
      if (!isEditing && profId) {
          const prof = professionals.find(p => p.id === profId)
          if (prof && prof.default_session_price) {
              setSessionPrice(prof.default_session_price)
          }
      }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    let result;
    
    if (isEditing && appointment) {
        result = await updateAppointment(appointment.id, formData)
    } else {
        result = await createAppointment(formData)
    }
    
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(isEditing ? 'Agendamento atualizado!' : 'Agendamento criado com sucesso!')
      onClose()
    }
  }

  async function handleCancel() {
      if (!appointment) return
      if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return

      setLoading(true)
      const res = await cancelAppointment(appointment.id)
      setLoading(false)

      if (res.error) {
          toast.error(res.error)
      } else {
          toast.success('Agendamento cancelado.')
          onClose()
      }
  }

  async function handleComplete() {
      if (!appointment) return
      if (!confirm('Confirma a conclusão do atendimento? Isso irá gerar o lançamento financeiro.')) return

      setLoading(true)
      const res = await completeAppointment(appointment.id)
      setLoading(false)
      
      if (res.error) {
          toast.error(res.error)
      } else {
          toast.success('Atendimento concluído e financeiro gerado!')
          onClose()
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
        
        <div className="mb-4">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h2>
            {isEditing && appointment && (
                <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${appointment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        Status: {appointment.status === 'scheduled' ? 'Agendado' : appointment.status}
                    </span>
                </div>
            )}
        </div>
        
        
        <form action={handleSubmit} className="space-y-4">
          {/* Client */}
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select name="client_id" required defaultValue={defaultClientId} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" disabled={isEditing && appointment?.status === 'completed'}>
              <option value="">Selecione um cliente</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium mb-1">Serviço</label>
            <select name="service_id" required defaultValue={defaultServiceId} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" disabled={isEditing && appointment?.status === 'completed'}>
              <option value="">Selecione um serviço</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min) - R$ {s.price}</option>
              ))}
            </select>
          </div>

          {/* Professional */}
          <div>
            <label className="block text-sm font-medium mb-1">Profissional</label>
            <select 
                name="professional_id" 
                required 
                value={selectedProfessionalId}
                onChange={handleProfessionalChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                disabled={isEditing && appointment?.status === 'completed'}
            >
              <option value="">Selecione um profissional</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Session Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Valor da Sessão (R$)</label>
            <input 
                type="number" 
                name="session_price" 
                step="0.01"
                value={sessionPrice}
                onChange={(e) => setSessionPrice(e.target.value)}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="0.00"
                disabled={isEditing && appointment?.status === 'completed'}
            />
            <p className="text-xs text-gray-500 mt-1">Preenchido automaticamente com o valor padrão do profissional.</p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <input 
                type="date" 
                name="date" 
                required 
                defaultValue={defaultDateValue}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                disabled={isEditing && appointment?.status === 'completed'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Horário</label>
              <input 
                type="time" 
                name="time" 
                required 
                defaultValue={defaultTimeValue}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                disabled={isEditing && appointment?.status === 'completed'}
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col md:flex-row justify-end gap-2 items-center">
            {/* Extra Actions for Editing */}
            {isEditing && appointment && (
                <div className="w-full md:w-auto md:flex-1 flex gap-2 justify-start order-2 md:order-1 mt-2 md:mt-0">
                     <button 
                        type="button"
                        onClick={handleCancel}
                        disabled={loading || appointment.status === 'canceled' || appointment.status === 'completed'}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 text-sm rounded border border-transparent hover:border-red-200 transition disabled:opacity-50"
                        title="Cancelar Agendamento"
                     >
                        Cancelar
                    </button>
                     {appointment.status !== 'completed' && appointment.status !== 'canceled' && (
                        <button 
                            type="button"
                            onClick={handleComplete}
                            disabled={loading}
                            className="px-3 py-2 text-green-600 hover:bg-green-50 text-sm rounded border border-transparent hover:border-green-200 transition flex items-center gap-1"
                            title="Concluir Atendimento e Gerar Financeiro"
                        >
                            <span className="material-symbols-outlined text-sm">check</span>
                            Concluir
                        </button>
                     )}
                </div>
            )}

            <div className="flex gap-2 order-1 md:order-2 w-full md:w-auto justify-end">
                <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                >
                Fechar
                </button>
                
                {/* Only show Save/Update if not completed/canceled */}
                {(!isEditing || (appointment?.status !== 'completed' && appointment?.status !== 'canceled')) && (
                    <button 
                    type="submit" 
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                    >
                    {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Agendar')}
                    </button>
                )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
