'use client'

import React, { useState } from 'react'
import { UserPlus, Database, Edit2, Trash2, Search, Phone, MapPin, Tag } from 'lucide-react'
import ClientModal from './ClientModal'
import { deleteClientAction, seedInitialDataAction } from '../actions'
import { toast } from 'sonner'

export default function ClientsClient({ initialClients }: { initialClients: any[] }) {
    const [clients, setClients] = useState(initialClients)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<any>(null)
    const [search, setSearch] = useState('')
    const [loadingSeed, setLoadingSeed] = useState(false)

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.cidade?.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return
        
        try {
            const res = await deleteClientAction(id)
            if (res.success) {
                setClients(clients.filter(c => c.id !== id))
                toast.success('Cliente removido')
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error('Erro ao excluir')
        }
    }

    const handleSeed = async () => {
        setLoadingSeed(true)
        try {
            const res = await seedInitialDataAction()
            if (res.success) {
                toast.success('Dados iniciais carregados com sucesso!')
                window.location.reload()
            } else {
                toast.error(res.error || 'Erro ao carregar sementes')
            }
        } catch (err) {
            toast.error('Erro crítico no seed')
        } finally {
            setLoadingSeed(false)
        }
    }

    const openCreateModal = () => {
        setEditingClient(null)
        setIsModalOpen(true)
    }

    const openEditModal = (client: any) => {
        setEditingClient(client)
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-8 w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Buscar cliente por nome, email ou cidade..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-3 pl-10 rounded-xl text-white outline-none focus:border-blue-500 transition-all text-sm shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {clients.length === 0 && (
                        <button 
                            onClick={handleSeed}
                            disabled={loadingSeed}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-bold uppercase text-xs transition-all border border-slate-700"
                        >
                            <Database className="w-4 h-4" />
                            {loadingSeed ? 'Semeando...' : 'Carregar Dados Iniciais'}
                        </button>
                    )}
                    <button 
                        onClick={openCreateModal}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs transition-all shadow-lg shadow-blue-600/20"
                    >
                        <UserPlus className="w-4 h-4" />
                        Novo Cliente
                    </button>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800">
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Cliente / Razão</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Tipo</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Contato</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Localização</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-blue-500 border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                                                {client.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{client.name}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">{client.email || 'SEM E-MAIL'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs">
                                        <span className={`px-2 py-1 rounded-md font-bold uppercase text-[9px] tracking-widest ${
                                            client.type === 'interno' 
                                            ? 'bg-purple-900/40 text-purple-400 border border-purple-800' 
                                            : 'bg-emerald-900/40 text-emerald-400 border border-emerald-800'
                                        }`}>
                                            {client.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs font-mono text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-slate-600" />
                                            {client.phone || '--'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-slate-400">
                                        <div className="flex items-center gap-2 italic">
                                            <MapPin className="w-3 h-3 text-slate-600" />
                                            {client.cidade ? `${client.cidade}/${client.estado}` : 'N/D'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openEditModal(client)}
                                                className="p-2 hover:bg-blue-600/20 text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/30"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(client.id)}
                                                className="p-2 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredClients.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center gap-4">
                            <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
                                <Search className="w-8 h-8 text-slate-700" />
                            </div>
                            <div>
                                <h4 className="text-slate-400 font-bold">Nenhum cliente encontrado</h4>
                                <p className="text-slate-600 text-xs">Ajuste seu filtro ou cadastre um novo cliente.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ClientModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                client={editingClient}
            />
        </div>
    )
}
