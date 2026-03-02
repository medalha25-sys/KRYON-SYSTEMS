'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, User, Phone, Mail, MapPin, FileEdit } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientAction, updateClientAction } from '../actions'
import { toast } from 'sonner'

interface Props {
    isOpen: boolean
    onClose: () => void
    client?: any 
}

export default function ClientModal({ isOpen, onClose, client }: Props) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        type: 'externo',
        phone: '',
        email: '',
        address: '',
        cidade: '',
        estado: '',
        observacoes: ''
    })

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || '',
                type: client.type || 'externo',
                phone: client.phone || '',
                email: client.email || '',
                address: client.address || '',
                cidade: client.cidade || '',
                estado: client.estado || '',
                observacoes: client.observacoes || ''
            })
        } else {
            setFormData({
                name: '',
                type: 'externo',
                phone: '',
                email: '',
                address: '',
                cidade: '',
                estado: '',
                observacoes: ''
            })
        }
    }, [client, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = client 
                ? await updateClientAction(client.id, formData as any)
                : await createClientAction(formData as any)

            if (res.success) {
                toast.success(client ? 'Atualizado!' : 'Cadastrado!')
                onClose()
                window.location.reload()
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error('Erro ao salvar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="bg-neutral-900 border border-neutral-800 rounded-t-[2.5rem] md:rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl"
                    >
                        <header className="p-8 border-b border-neutral-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
                                    {client ? 'Editar Cliente' : 'Novo Cliente'}
                                </h2>
                                <p className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase mt-1">Cadastro Rápido</p>
                            </div>
                            <button onClick={onClose} className="p-3 bg-neutral-800 rounded-full text-neutral-400">
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar pb-12">
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block tracking-widest px-1">Nome Completo</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-neutral-950 border border-neutral-800 p-5 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors"
                                        placeholder="Ex: João da Silva"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block tracking-widest px-1">Telefone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                            <input 
                                                type="text" 
                                                value={formData.phone}
                                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                                className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-12 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block tracking-widest px-1">E-mail</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                            <input 
                                                type="email" 
                                                value={formData.email}
                                                onChange={e => setFormData({...formData, email: e.target.value})}
                                                className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-12 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors"
                                                placeholder="exemplo@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block tracking-widest px-1">Localização (Cidade/UF)</label>
                                    <div className="flex gap-3">
                                        <input 
                                            type="text" 
                                            value={formData.cidade}
                                            placeholder="Cidade"
                                            onChange={e => setFormData({...formData, cidade: e.target.value})}
                                            className="flex-[3] bg-neutral-950 border border-neutral-800 p-5 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors"
                                        />
                                        <input 
                                            type="text" 
                                            maxLength={2}
                                            placeholder="UF"
                                            value={formData.estado}
                                            onChange={e => setFormData({...formData, estado: e.target.value.toUpperCase()})}
                                            className="flex-1 bg-neutral-950 border border-neutral-800 p-5 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors text-center uppercase"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block tracking-widest px-1">Endereço de Entrega</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-5 w-4 h-4 text-neutral-600" />
                                        <textarea 
                                            value={formData.address}
                                            onChange={e => setFormData({...formData, address: e.target.value})}
                                            className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-12 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors min-h-[100px] resize-none"
                                            placeholder="Rua, Número, Bairro, Referência..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-6 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-sm tracking-widest rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20 transition-all disabled:opacity-50 active:scale-95 mb-4"
                            >
                                {loading ? 'Processando...' : (
                                    <>
                                        <Save className="w-5 h-5 stroke-[3px]" />
                                        {client ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
