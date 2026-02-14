'use client'

import React, { useState } from 'react'
import { Pet, PetOwner } from '@/types/gestao-pet'
import { deletePetAction } from './actions'
import { toast } from 'sonner'
import PetModal from './PetModal'

interface PetListProps {
  pets: Pet[]
  owners: PetOwner[] // Passed down to popualte select in modal
}

export default function PetList({ pets, owners }: PetListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [search, setSearch] = useState('')

  const filteredPets = pets.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.pet_owners?.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este pet?')) {
        const res = await deletePetAction(id)
        if (res.error) toast.error(res.error)
        else toast.success('Pet excluído com sucesso')
    }
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingPet(null)
  }

  const handleNew = () => {
      setEditingPet(null)
      setIsModalOpen(true)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pets</h1>
        <button 
           onClick={handleNew}
           className="bg-primary text-white px-4 py-2 rounded"
        >
          + Novo Pet
        </button>
      </div>

      <input 
        type="text" 
        placeholder="Buscar por nome do pet ou tutor..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-4 max-w-md dark:bg-gray-800 dark:border-gray-700"
      />

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Espécie/Raça</th>
              <th className="p-4">Tutor</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPets.map(pet => (
              <tr key={pet.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-medium">{pet.name}</td>
                <td className="p-4">{pet.species || '-'} / {pet.breed || '-'}</td>
                <td className="p-4">{pet.pet_owners?.name || 'Sem tutor'}</td>
                <td className="p-4 text-right gap-2">
                  <button onClick={() => handleEdit(pet)} className="text-blue-600 hover:underline mr-3">Editar</button>
                  <button onClick={() => handleDelete(pet.id)} className="text-red-600 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
            {filteredPets.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">Nenhum pet encontrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <PetModal 
          isOpen={isModalOpen} 
          onClose={handleClose} 
          pet={editingPet}
          owners={owners} 
        />
      )}
    </div>
  )
}
