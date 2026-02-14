'use client'

import React, { useState } from 'react'
import { Client } from '@/types/agenda'
import { createClientAction, updateClientAction, deleteClientAction } from '@/app/products/agenda-facil/clientes/actions'
import { toast } from 'sonner'

interface ClientListProps {
  clients: Client[]
}

export default function ClientList({ clients }: ClientListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [search, setSearch] = useState('')

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        const res = await deleteClientAction(id)
        if (res.error) toast.error(res.error)
        else toast.success('Cliente excluído com sucesso')
    }
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingClient(null)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button 
           onClick={() => setIsModalOpen(true)}
           className="bg-primary text-white px-4 py-2 rounded"
        >
          + Novo Cliente
        </button>
      </div>

      <input 
        type="text" 
        placeholder="Buscar clientes..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-4 max-w-md dark:bg-gray-800 dark:border-gray-700"
      />

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Telefone</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr key={client.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-medium">{client.name}</td>
                <td className="p-4">{client.phone}</td>
                <td className="p-4">{client.email}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <a href={`/products/agenda-facil/clientes/${client.id}`} className="text-gray-600 hover:text-blue-600 mr-2" title="Visualizar Prontuário">
                    <span className="material-symbols-outlined">visibility</span>
                  </a>
                  <button onClick={() => handleEdit(client)} className="text-blue-600 hover:text-blue-800 mr-2" title="Editar">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-800" title="Excluir">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">Nenhum cliente encontrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ClientModal 
          isOpen={isModalOpen} 
          onClose={handleClose} 
          client={editingClient} 
        />
      )}
    </div>
  )
}

function ClientModal({ isOpen, onClose, client }: { isOpen: boolean, onClose: () => void, client: Client | null }) {
    if (!isOpen) return null

    async function handleSubmit(formData: FormData) {
        const res = client 
            ? await updateClientAction(client.id, formData)
            : await createClientAction(formData)
        
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(client ? 'Cliente atualizado!' : 'Cliente criado!')
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{client ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Nome</label>
                        <input name="name" defaultValue={client?.name} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Telefone</label>
                        <input name="phone" defaultValue={client?.phone} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input name="email" type="email" defaultValue={client?.email} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Notas</label>
                        <textarea name="notes" defaultValue={client?.notes} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
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
