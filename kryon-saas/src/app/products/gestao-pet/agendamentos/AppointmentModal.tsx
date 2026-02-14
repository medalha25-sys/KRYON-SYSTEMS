'use client'

import React from 'react'
import { PetAppointment, Pet } from '@/types/gestao-pet'
import { createPetAppointmentAction, updatePetAppointmentAction } from './actions'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface AppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    appointment: PetAppointment | null
    pets: Pet[]
}

export default function AppointmentModal({ isOpen, onClose, appointment, pets }: AppointmentModalProps) {
    if (!isOpen) return null

    async function handleSubmit(formData: FormData) {
        const res = appointment 
            ? await updatePetAppointmentAction(appointment.id, formData)
            : await createPetAppointmentAction(formData)
        
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(appointment ? 'Agendamento atualizado!' : 'Agendamento criado!')
            onClose()
        }
    }

    const defaultDate = appointment ? format(new Date(appointment.appointment_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    const defaultTime = appointment ? format(new Date(appointment.appointment_date), 'HH:mm') : '09:00'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
                <form action={handleSubmit} className="space-y-4">
                    
                    <div>
                        <label className="block text-sm mb-1">Pet</label>
                        <select name="pet_id" defaultValue={appointment?.pet_id} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="">Selecione um pet...</option>
                            {pets.map(pet => (
                                <option key={pet.id} value={pet.id}>
                                    {pet.name} ({pet.pet_owners?.name})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Serviço</label>
                        <select name="service" defaultValue={appointment?.service} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="Banho">Banho</option>
                            <option value="Tosa">Tosa</option>
                            <option value="Banho e Tosa">Banho e Tosa</option>
                            <option value="Consulta">Consulta Veterinária</option>
                            <option value="Vacinação">Vacinação</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Data</label>
                            <input name="date" type="date" defaultValue={defaultDate} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Hora</label>
                            <input name="time" type="time" defaultValue={defaultTime} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Status</label>
                        <select name="status" defaultValue={appointment?.status || 'scheduled'} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="scheduled">Agendado</option>
                            <option value="completed">Concluído</option>
                            <option value="canceled">Cancelado</option>
                        </select>
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
