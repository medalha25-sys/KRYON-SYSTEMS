'use client'

import React, { useState } from 'react'
import { Professional } from '@/types/agenda'
import { blockSchedule } from '@/app/products/agenda-facil/actions'
import { toast } from 'sonner'

interface BlockScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  professionals: Professional[]
  initialDate?: Date
  initialProfessionalId?: string
}

export default function BlockScheduleModal({
  isOpen,
  onClose,
  professionals,
  initialDate,
  initialProfessionalId
}: BlockScheduleModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const defaultDate = initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await blockSchedule(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Horário bloqueado com sucesso!')
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
        
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Bloquear Horário</h2>
        
        <form action={handleSubmit} className="space-y-4">
          
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

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-1">Motivo</label>
            <input 
                type="text" 
                name="reason" 
                required 
                placeholder="Ex: Almoço, Reunião, Ausência"
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Date & Time */}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Início</label>
              <input 
                type="time" 
                name="start_time" 
                required 
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Término</label>
              <input 
                type="time" 
                name="end_time" 
                required 
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
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Bloqueando...' : 'Bloquear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
