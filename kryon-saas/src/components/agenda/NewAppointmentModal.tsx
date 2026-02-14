'use client'

import React, { useState } from 'react'
import { Client, Professional, Service } from '@/types/agenda'
import { createAppointment } from '@/app/products/agenda-facil/actions'
import { toast } from 'sonner' // Assuming sonner is available

interface NewAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  clients: Client[]
  services: Service[]
  professionals: Professional[]
  initialDate?: Date
  initialTime?: string // HH:mm
  initialProfessionalId?: string
}

export default function NewAppointmentModal({
  isOpen,
  onClose,
  clients,
  services,
  professionals,
  initialDate,
  initialTime,
  initialProfessionalId
}: NewAppointmentModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await createAppointment(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Agendamento criado com sucesso!')
      onClose()
    }
  }

  // Pre-fill date string YYYY-MM-DD
  const defaultDate = initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Novo Agendamento</h2>
        
        <form action={handleSubmit} className="space-y-4">
          {/* Client */}
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select name="client_id" required className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600">
              <option value="">Selecione um cliente</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {/* TODO: Add 'New Client' button */}
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium mb-1">Serviço</label>
            <select name="service_id" required className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600">
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
                defaultValue={initialProfessionalId || ''}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Selecione um profissional</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <input 
                type="date" 
                name="date" 
                required 
                defaultValue={defaultDate}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Horário</label>
              <input 
                type="time" 
                name="time" 
                required 
                defaultValue={initialTime || '09:00'}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
