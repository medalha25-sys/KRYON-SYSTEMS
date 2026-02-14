'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold">Escolha seu plano</h1>
        <p className="text-xl text-gray-400">Você não possui nenhuma assinatura ativa no momento.</p>
        
        <div className="grid md:grid-cols-2 gap-8 mt-12">
            {/* Plan Card Example */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500/50 transition">
                <h2 className="text-2xl font-bold mb-4">Agenda Fácil</h2>
                <p className="text-3xl font-bold mb-6">R$ 49,90<span className="text-sm text-gray-400 font-normal">/mês</span></p>
                <ul className="text-left space-y-3 mb-8 text-gray-300">
                    <li className="flex gap-2"><Check className="text-green-400" /> Agendamentos Ilimitados</li>
                    <li className="flex gap-2"><Check className="text-green-400" /> Gestão de Clientes</li>
                </ul>
                <Link href="/trial?product=agenda-facil" className="block w-full py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 transition">
                    Começar Teste Grátis
                </Link>
            </div>
             <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-orange-500/50 transition">
                <h2 className="text-2xl font-bold mb-4">Gestão Pet</h2>
                <p className="text-3xl font-bold mb-6">R$ 89,90<span className="text-sm text-gray-400 font-normal">/mês</span></p>
                <ul className="text-left space-y-3 mb-8 text-gray-300">
                    <li className="flex gap-2"><Check className="text-green-400" /> Controle Veterinário</li>
                    <li className="flex gap-2"><Check className="text-green-400" /> Gestão de Banho e Tosa</li>
                </ul>
                <Link href="/trial?product=gestao-pet" className="block w-full py-3 bg-orange-600 rounded-lg font-bold hover:bg-orange-500 transition">
                    Começar Teste Grátis
                </Link>
            </div>
        </div>
      </div>
    </div>
  )
}
