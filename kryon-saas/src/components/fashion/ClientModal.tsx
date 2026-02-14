'use client'

import React, { useState } from 'react'
import { createClientAction, updateClientAction } from '@/app/fashion/clientes/actions'
import { FashionCustomer } from '@/types/fashion'
import { toast } from 'sonner'

interface ClientModalProps {
    isOpen: boolean
    onClose: () => void
    client: FashionCustomer | null
}

export default function ClientModal({ isOpen, onClose, client }: ClientModalProps) {
    const [isSaving, setIsSaving] = useState(false)

    if (!isOpen) return null

    async function handleSubmit(formData: FormData) {
        setIsSaving(true)
        try {
            const res = client 
                ? await updateClientAction(client.id, formData)
                : await createClientAction(formData)
            
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(client ? 'Cliente atualizado!' : 'Cliente criado!')
                onClose()
            }
        } catch (error) {
            console.error(error)
            toast.error('Erro inesperado ao salvar cliente.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {client ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                        <input 
                            name="name" 
                            defaultValue={client?.name} 
                            required 
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition" 
                            placeholder="Nome completo"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input 
                            name="email" 
                            type="email" 
                            defaultValue={client?.email || ''} 
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition" 
                            placeholder="email@exemplo.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                        <input 
                            name="phone" 
                            defaultValue={client?.phone || ''} 
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition" 
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                        <input 
                            name="city" 
                            defaultValue={client?.city || ''} 
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition" 
                            placeholder="Cidade"
                        />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isSaving}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
