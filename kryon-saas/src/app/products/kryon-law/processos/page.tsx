import React from 'react'
import { Gavel, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getCases } from '../actions'

export default async function ProcessosPage() {
    const cases = await getCases()

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <Link href="/products/kryon-law" className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Dashboard
                </Link>

                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-blue-900/30 rounded-lg">
                            <Gavel className="w-6 h-6 text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Processos</h1>
                    </div>
                    <p className="text-gray-400">Gerencie todos os seus processos judiciais em um só lugar.</p>
                </header>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                    <p className="text-gray-500">A filtragem e busca avançada de processos estarão disponíveis em breve.</p>
                </div>
            </div>
        </div>
    )
}
