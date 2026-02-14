'use client'

import React, { useState } from 'react'
import { Professional } from '@/types/agenda'
import { createProfessionalAction, updateProfessionalAction, deleteProfessionalAction } from '@/app/products/agenda-facil/profissionais/actions'
import WorkScheduleForm from './WorkScheduleForm'
import { toast } from 'sonner'

interface ProfessionalListProps {
  professionals: Professional[]
}

export default function ProfessionalList({ professionals }: ProfessionalListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null)

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este profissional?')) {
        const res = await deleteProfessionalAction(id)
        if (res.error) toast.error(res.error)
        else toast.success('Profissional excluído com sucesso')
    }
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingProfessional(null)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profissionais</h1>
        <button 
           onClick={() => setIsModalOpen(true)}
           className="bg-primary text-white px-4 py-2 rounded"
        >
          + Novo Profissional
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Especialidade</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {professionals.map(prof => (
              <tr key={prof.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-medium">{prof.name}</td>
                <td className="p-4">{prof.specialty || '-'}</td>
                <td className="p-4 text-right gap-2">
                  <button onClick={() => { setEditingProfessional(prof); setScheduleModalOpen(true); }} className="text-green-600 hover:underline mr-3">Horários</button>
                  <button onClick={() => handleEdit(prof)} className="text-blue-600 hover:underline mr-3">Editar</button>
                  <button onClick={() => handleDelete(prof.id)} className="text-red-600 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
            {professionals.length === 0 && (
                <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">Nenhum profissional cadastrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProfessionalModal 
          isOpen={isModalOpen} 
          onClose={handleClose} 
          professional={editingProfessional} 
        />
      )}

      {scheduleModalOpen && editingProfessional && (
        <WorkScheduleForm
            professional={editingProfessional}
            onClose={() => { setScheduleModalOpen(false); setEditingProfessional(null); }}
        />
      )}
    </div>
  )
}

function ProfessionalModal({ isOpen, onClose, professional }: { isOpen: boolean, onClose: () => void, professional: Professional | null }) {
    if (!isOpen) return null

    async function handleSubmit(formData: FormData) {
        const res = professional 
            ? await updateProfessionalAction(professional.id, formData)
            : await createProfessionalAction(formData)
        
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(professional ? 'Profissional atualizado!' : 'Profissional criado!')
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{professional ? 'Editar Profissional' : 'Novo Profissional'}</h2>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Nome</label>
                        <input name="name" defaultValue={professional?.name} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Especialidade</label>
                        <input name="specialty" defaultValue={professional?.specialty} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
