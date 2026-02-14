'use client'

import React, { useState } from 'react'
import { PetAppointment, Pet } from '@/types/gestao-pet'
import { deletePetAppointmentAction } from './actions'
import { toast } from 'sonner'
import AppointmentModal from './AppointmentModal'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AppointmentListProps {
  appointments: PetAppointment[]
  pets: Pet[]
}

export default function AppointmentList({ appointments, pets }: AppointmentListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<PetAppointment | null>(null)
  
  // Simple filter by status or pet name could be added here
  
  const handleEdit = (apt: PetAppointment) => {
    setEditingAppointment(apt)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        const res = await deletePetAppointmentAction(id)
        if (res.error) toast.error(res.error)
        else toast.success('Agendamento excluído com sucesso')
    }
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingAppointment(null)
  }

  const handleNew = () => {
      setEditingAppointment(null)
      setIsModalOpen(true)
  }

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'completed': return 'bg-green-100 text-green-800'
          case 'canceled': return 'bg-red-100 text-red-800'
          default: return 'bg-blue-100 text-blue-800'
      }
  }

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'completed': return 'Concluído'
          case 'canceled': return 'Cancelado'
          default: return 'Agendado'
      }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agendamentos Pet</h1>
        <button 
           onClick={handleNew}
           className="bg-primary text-white px-4 py-2 rounded"
        >
          + Novo Agendamento
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
            <tr>
              <th className="p-4">Data/Hora</th>
              <th className="p-4">Pet</th>
              <th className="p-4">Serviço</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(apt => (
              <tr key={apt.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4">
                    {format(new Date(apt.appointment_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </td>
                <td className="p-4">
                    <div className="font-medium">{apt.pets?.name}</div>
                    <div className="text-sm text-gray-500">{apt.pets?.pet_owners?.name}</div>
                </td>
                <td className="p-4">{apt.service}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(apt.status)}`}>
                        {getStatusLabel(apt.status)}
                    </span>
                </td>
                <td className="p-4 text-right gap-2">
                  <button onClick={() => handleEdit(apt)} className="text-blue-600 hover:underline mr-3">Editar</button>
                  <button onClick={() => handleDelete(apt.id)} className="text-red-600 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">Nenhum agendamento encontrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AppointmentModal 
          isOpen={isModalOpen} 
          onClose={handleClose} 
          appointment={editingAppointment}
          pets={pets} 
        />
      )}
    </div>
  )
}
