'use client'

import React from 'react'
import { PetOwner } from '@/types/gestao-pet'
import { createPetOwnerAction, updatePetOwnerAction } from './actions'
import { toast } from 'sonner'

interface OwnerModalProps {
    isOpen: boolean
    onClose: () => void
    owner: PetOwner | null
}

export default function OwnerModal({ isOpen, onClose, owner }: OwnerModalProps) {
    if (!isOpen) return null

    async function handleSubmit(formData: FormData) {
        const res = owner 
            ? await updatePetOwnerAction(owner.id, formData)
            : await createPetOwnerAction(formData)
        
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(owner ? 'Tutor atualizado!' : 'Tutor criado!')
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{owner ? 'Editar Tutor' : 'Novo Tutor'}</h2>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Nome Completo</label>
                        <input name="name" defaultValue={owner?.name} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Telefone (WhatsApp)</label>
                        <input name="phone" defaultValue={owner?.phone} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" placeholder="(11) 99999-9999" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Email (Opcional)</label>
                        <input name="email" type="email" defaultValue={owner?.email} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
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
