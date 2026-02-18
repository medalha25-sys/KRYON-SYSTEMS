'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function PatientRecords({ records }: { records: any[] }) {
    if (!records || records.length === 0) {
        return <div className="p-8 text-center text-gray-500">Nenhum prontuário encontrado.</div>
    }

    return (
        <div className="space-y-4">
            {records.map((record) => (
                <div key={record.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {format(new Date(record.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Profissional: {record.professional?.name || '---'}
                            </p>
                        </div>
                        <a href={`/products/agenda-facil/prontuario/${record.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Ver Detalhes
                        </a>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="line-clamp-3 text-gray-700 dark:text-gray-300">
                            {record.complaint || record.description || 'Sem descrição.'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
