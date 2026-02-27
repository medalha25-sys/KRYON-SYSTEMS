'use client'

import React, { useState } from 'react'
import { Service } from '@/types/agenda'
import { createServiceAction, updateServiceAction, deleteServiceAction } from '@/app/products/agenda-facil/servicos/actions'
import { toast } from 'sonner'

interface ServiceListProps {
  services: Service[]
}

export default function ServiceList({ services }: ServiceListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
        const res = await deleteServiceAction(id)
        if (res.error) toast.error(res.error)
        else toast.success('Serviço excluído com sucesso')
    }
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingService(null)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Serviços</h1>
        <button 
           onClick={() => setIsModalOpen(true)}
           className="bg-primary text-white px-4 py-2 rounded"
        >
          + Novo Serviço
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Duração (min)</th>
              <th className="p-4">Preço (R$)</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-medium">{service.name}</td>
                <td className="p-4">{service.duration_minutes} min</td>
                <td className="p-4">R$ {service.price?.toFixed(2)}</td>
                <td className="p-4 text-right gap-2">
                  <button onClick={() => handleEdit(service)} className="text-blue-600 hover:underline mr-3">Editar</button>
                  <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">Nenhum serviço cadastrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ServiceModal 
          isOpen={isModalOpen} 
          onClose={handleClose} 
          service={editingService} 
        />
      )}
    </div>
  )
}

function ServiceModal({ isOpen, onClose, service }: { isOpen: boolean, onClose: () => void, service: Service | null }) {
    if (!isOpen) return null

    async function handleSubmit(formData: FormData) {
        const res = service 
            ? await updateServiceAction(service.id, formData)
            : await createServiceAction(formData)
        
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(service ? 'Serviço atualizado!' : 'Serviço criado!')
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{service ? 'Editar Serviço' : 'Novo Serviço'}</h2>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Nome</label>
                        <input name="name" defaultValue={service?.name} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Duração (min)</label>
                            <input name="duration_minutes" type="number" defaultValue={service?.duration_minutes || 30} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Preço (R$)</label>
                            <input name="price" type="number" step="0.01" defaultValue={service?.price || 0} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
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
