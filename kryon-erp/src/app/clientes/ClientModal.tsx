'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, User, Phone, Mail, MapPin, FileEdit } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientAction, updateClientAction } from '../actions'
import { toast } from 'sonner'

interface Props {
    isOpen: boolean
    onClose: () => void
    client?: any // Existing client for editing
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
                ? await updateClientAction(client.id, formData)
                : await createClientAction(formData)

            if (res.success) {
                toast.success(client ? 'Cliente atualizado!' : 'Cliente cadastrado!')
                onClose()
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error('Erro ao salvar dados')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                    >
                        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                            <div>
                                <h2 className="text-xl font-black italic tracking-tighter uppercase text-white flex items-center gap-2">
                                    {client ? <FileEdit className="w-5 h-5 text-blue-500" /> : <User className="w-5 h-5 text-blue-500" />}
                                    {client ? 'Editar Cliente' : 'Novo Cliente'}
                                </h2>
                                <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mt-1">CRM // Gestão de Entidades</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest">Nome Completo / Razão Social</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                                        placeholder="Ex: Construtora Alfa LTDA"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest">Tipo de Cliente</label>
                                    <select 
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value as any})}
                                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="externo">Externo (B2B/B2C)</option>
                                        <option value="interno">Interno (Obras Próprias)</option>
                                    </select>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest">Telefone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            type="text" 
                                            value={formData.phone}
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 p-3 pl-10 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest">E-mail</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            type="email" 
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 p-3 pl-10 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                                            placeholder="exemplo@email.com"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest">Endereço</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-4 w-4 h-4 text-slate-500" />
                                        <textarea 
                                            value={formData.address}
                                            onChange={e => setFormData({...formData, address: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 p-3 pl-10 rounded-xl text-white outline-none focus:border-blue-500 transition-colors min-h-[80px]"
                                            placeholder="Rua, Número, Bairro..."
                                        />
                                    </div>
                                </div>

                                {/* City */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest">Cidade</label>
                                    <input 
                                        type="text" 
                                        value={formData.cidade}
                                        onChange={e => setFormData({...formData, cidade: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                {/* State */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest">Estado (UF)</label>
                                    <input 
                                        type="text" 
                                        maxLength={2}
                                        value={formData.estado}
                                        onChange={e => setFormData({...formData, estado: e.target.value.toUpperCase()})}
                                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-colors uppercase"
                                        placeholder="SP"
                                    />
                                </div>

                                {/* Notes */}
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest">Observações Internas</label>
                                    <textarea 
                                        value={formData.observacoes}
                                        onChange={e => setFormData({...formData, observacoes: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-colors min-h-[100px]"
                                        placeholder="Detalhes adicionais..."
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50 -mx-8 -mb-8 p-8">
                                <button 
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 rounded-xl text-slate-400 font-bold uppercase text-xs hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Salvando...' : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {client ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
