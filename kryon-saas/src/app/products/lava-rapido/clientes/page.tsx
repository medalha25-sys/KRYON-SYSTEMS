'use client'

import { useState } from 'react'
import { Plus, Search, User, Car, Phone, Mail, MoreVertical, Filter, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ClientsVehiclesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Clientes & Veículos</h1>
          <p className="text-gray-400">Gerencie sua base de clientes e a frota de veículos atendidos.</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all">
                <Plus className="w-5 h-5" />
                Novo Veículo
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20">
                <Plus className="w-5 h-5" />
                Novo Cliente
            </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome, telefone ou placa..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-400 hover:text-white transition">
            <Filter className="w-4 h-4" />
            Filtros
        </button>
      </div>

      {/* Clients List */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Contato</th>
                <th className="px-6 py-4 font-medium">Veículos</th>
                <th className="px-6 py-4 font-medium">Última Visita</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              <ClientRow 
                name="João Silva" 
                email="joao@email.com" 
                phone="(11) 99999-9999" 
                vehicles={[{ plate: 'ABC-1234', model: 'Honda Civic (Prata)' }]}
                lastVisit="Há 3 dias"
              />
              <ClientRow 
                name="Maria Oliveira" 
                email="maria@email.com" 
                phone="(11) 98888-8888" 
                vehicles={[{ plate: 'XYZ-9876', model: 'Jeep Compass (Preto)' }, { plate: 'DEF-5678', model: 'Fiat Pulse (Branco)' }]}
                lastVisit="Ontem"
              />
              <ClientRow 
                name="Carlos Santos" 
                email="carlos@email.com" 
                phone="(11) 97777-7777" 
                vehicles={[{ plate: 'KRY-2024', model: 'Toyota Corolla (Azul)' }]}
                lastVisit="Há 2 semanas"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ClientRow({ name, email, phone, vehicles, lastVisit }: any) {
  return (
    <tr className="hover:bg-gray-800/30 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-blue-400 font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-white group-hover:text-blue-400 transition">{name}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
           <Phone className="w-3.5 h-3.5" />
           {phone}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          {vehicles.map((v: any) => (
            <div key={v.plate} className="flex items-center gap-2 px-2 py-1 bg-gray-950 border border-gray-800 rounded text-[11px] w-fit">
              <Car className="w-3 h-3 text-blue-500" />
              <span className="font-mono text-white">{v.plate}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{v.model}</span>
            </div>
          ))}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-400">{lastVisit}</span>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-500 hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </td>
    </tr>
  )
}
