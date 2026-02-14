'use client'

import React, { useState } from 'react'
import { PetOwner } from '@/types/gestao-pet'
import { deletePetOwnerAction } from './actions'
import { toast } from 'sonner'
import OwnerModal from './OwnerModal'

interface OwnerListProps {
  owners: PetOwner[]
}

export default function OwnerList({ owners }: OwnerListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOwner, setEditingOwner] = useState<PetOwner | null>(null)
  const [search, setSearch] = useState('')

  const filteredOwners = owners.filter(o => 
      o.name.toLowerCase().includes(search.toLowerCase()) || 
      o.phone.includes(search)
  )

  const handleEdit = (owner: PetOwner) => {
    setEditingOwner(owner)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza? Isso também excluirá os pets deste tutor.')) {
        const res = await deletePetOwnerAction(id)
        if (res.error) toast.error(res.error)
        else toast.success('Tutor excluído com sucesso')
    }
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingOwner(null)
  }

  const handleNew = () => {
      setEditingOwner(null)
      setIsModalOpen(true)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tutores (Clientes)</h1>
        <button 
           onClick={handleNew}
           className="bg-primary text-white px-4 py-2 rounded"
        >
          + Novo Tutor
        </button>
      </div>

      <input 
        type="text" 
        placeholder="Buscar por nome ou telefone..." 
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
            {filteredOwners.map(owner => (
              <tr key={owner.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-medium">{owner.name}</td>
                <td className="p-4">{owner.phone}</td>
                <td className="p-4">{owner.email || '-'}</td>
                <td className="p-4 text-right gap-2">
                  <button onClick={() => handleEdit(owner)} className="text-blue-600 hover:underline mr-3">Editar</button>
                  <button onClick={() => handleDelete(owner.id)} className="text-red-600 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
            {filteredOwners.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">Nenhum tutor encontrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <OwnerModal 
          isOpen={isModalOpen} 
          onClose={handleClose} 
          owner={editingOwner} 
        />
      )}
    </div>
  )
}
