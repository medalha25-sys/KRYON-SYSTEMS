'use client'

import React, { useState } from 'react'
import { Plus, Search, Phone, ChevronRight, User, Trash2 } from 'lucide-react'
import ClientModal from './ClientModal'
import { deleteClientAction } from '../actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function ClientsClient({ initialClients }: { initialClients: any[] }) {
    const [clients, setClients] = useState(initialClients)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<any>(null)
    const [search, setSearch] = useState('')

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!confirm('Excluir este cliente?')) return
        
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

    const openCreateModal = () => {
        setEditingClient(null)
        setIsModalOpen(true)
    }

    const openEditModal = (client: any) => {
        setEditingClient(client)
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-6">
            {/* Search and Add */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input 
                        type="text"
                        placeholder="Buscar por nome..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-neutral-900/50 border border-neutral-800 p-4 pl-12 rounded-2xl text-white outline-none focus:border-orange-500 transition-all text-sm"
                    />
                </div>
                <button 
                    onClick={openCreateModal}
                    className="bg-orange-600 text-black p-4 rounded-2xl shadow-lg shadow-orange-600/20 active:scale-90 transition-transform"
                >
                    <Plus className="w-6 h-6 stroke-[3px]" />
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                    {filteredClients.map((client, idx) => (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openEditModal(client)}
                            className="bg-neutral-900/40 border border-neutral-800 p-5 rounded-[2rem] flex items-center justify-between group cursor-pointer active:bg-neutral-900/80 transition-all"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center font-black text-orange-500 text-lg border border-neutral-700 group-hover:border-orange-500/50 transition-colors">
                                    {client.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white truncate leading-tight">{client.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Phone className="w-3 h-3 text-neutral-600" />
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider truncate">
                                            {client.phone || 'Sem telefone'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={(e) => handleDelete(e, client.id)}
                                    className="p-3 text-neutral-700 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <ChevronRight className="text-neutral-700" size={20} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredClients.length === 0 && (
                    <div className="py-20 text-center bg-neutral-950/50 border border-dashed border-neutral-900 rounded-[2rem]">
                        <User className="w-12 h-12 text-neutral-800 mx-auto mb-4" />
                        <p className="text-neutral-600 font-bold uppercase text-[10px] tracking-widest">Nenhum cliente na lista</p>
                    </div>
                )}
            </div>

            <ClientModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false)
                    // Optional: could trigger a refresh here if needed
                }} 
                client={editingClient}
            />
        </div>
    )
}
