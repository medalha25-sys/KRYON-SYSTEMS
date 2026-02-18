'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function PatientHistory({ appointments }: { appointments: any[] }) {
    if (!appointments || appointments.length === 0) {
        return <div className="p-8 text-center text-gray-500">Nenhum agendamento encontrado.</div>
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            case 'canceled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            case 'no_show': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'scheduled': return 'Agendado'
            case 'confirmed': return 'Confirmado'
            case 'completed': return 'Concluído'
            case 'canceled': return 'Cancelado'
            case 'no_show': return 'Não Compareceu'
            case 'requested': return 'Solicitado'
            default: return status
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                    <tr>
                        <th className="p-4">Data/Hora</th>
                        <th className="p-4">Serviço</th>
                        <th className="p-4">Profissional</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((apt) => (
                        <tr key={apt.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-4">
                                <div className="font-medium">
                                    {format(new Date(apt.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {apt.start_time} - {apt.end_time}
                                </div>
                            </td>
                            <td className="p-4 font-medium">
                                {apt.services?.name || 'Serviço excluído'}
                            </td>
                            <td className="p-4">
                                {apt.professionals?.name || '---'}
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                                    {getStatusLabel(apt.status)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
