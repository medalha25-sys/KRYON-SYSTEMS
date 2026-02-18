'use client'

import { Client } from '@/types/agenda'
import { updateClientAction } from '@/app/products/agenda-facil/clientes/actions'
import { toast } from 'sonner'
import { useState } from 'react'

export default function PatientProfile({ client }: { client: Client }) {
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        const res = await updateClientAction(client.id, formData)
        setIsLoading(false)
        
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Dados atualizados com sucesso')
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-6">Dados Pessoais</h2>
            <form action={handleSubmit} className="space-y-4 max-w-2xl">
                <div>
                     <label className="block text-sm mb-1">Nome Completo</label>
                     <input name="name" defaultValue={client.name} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-sm mb-1">CPF</label>
                         <input name="cpf" defaultValue={client.cpf} placeholder="000.000.000-00" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                     </div>
                     <div>
                         <label className="block text-sm mb-1">Data de Nascimento</label>
                         <input name="birth_date" type="date" defaultValue={client.birth_date} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                     </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm mb-1">Telefone</label>
                        <input name="phone" defaultValue={client.phone} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                     </div>
                     <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input name="email" type="email" defaultValue={client.email} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                     </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-700">
                     <div className="flex items-center gap-2">
                          <input type="checkbox" name="consent_lgpd" id="lgpd_profile" defaultChecked={client.consent_lgpd} className="w-4 h-4 text-primary rounded" />
                          <label htmlFor="lgpd_profile" className="text-sm font-medium">Consentimento LGPD</label>
                     </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                         Autorizo o armazenamento e tratamento dos meus dados pessoais para fins de agendamento e atendimento clínico.
                     </p>
                </div>
                <div>
                    <label className="block text-sm mb-1">Observações</label>
                    <textarea name="notes" defaultValue={client.notes} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={4} />
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isLoading} className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark disabled:opacity-50">
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    )
}
