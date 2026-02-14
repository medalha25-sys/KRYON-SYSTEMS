'use client'

import React from 'react'
import { Pet, PetOwner } from '@/types/gestao-pet'
import { createPetAction, updatePetAction } from './actions'
import { toast } from 'sonner'

interface PetModalProps {
    isOpen: boolean
    onClose: () => void
    pet: Pet | null
    owners: PetOwner[]
}

export default function PetModal({ isOpen, onClose, pet, owners }: PetModalProps) {
    if (!isOpen) return null

    async function handleSubmit(formData: FormData) {
        const res = pet 
            ? await updatePetAction(pet.id, formData)
            : await createPetAction(formData)
        
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(pet ? 'Pet atualizado!' : 'Pet criado!')
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{pet ? 'Editar Pet' : 'Novo Pet'}</h2>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Nome do Pet</label>
                        <input name="name" defaultValue={pet?.name} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    
                    <div>
                        <label className="block text-sm mb-1">Tutor (Proprietário)</label>
                        <select name="owner_id" defaultValue={pet?.owner_id} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="">Selecione um tutor...</option>
                            {owners.map(owner => (
                                <option key={owner.id} value={owner.id}>{owner.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Espécie</label>
                            <input name="species" defaultValue={pet?.species} placeholder="Ex: Cão, Gato" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Raça</label>
                            <input name="breed" defaultValue={pet?.breed} placeholder="Ex: Vira-lata" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Data de Nascimento</label>
                        <input name="birth_date" type="date" defaultValue={pet?.birth_date} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Observações</label>
                        <textarea name="notes" defaultValue={pet?.notes} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={3} />
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
