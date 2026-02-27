'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, Box, Construction, DollarSign, FileText, Tag, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createProductAction, updateProductAction } from '../actions'
import { toast } from 'sonner'

interface Props {
    isOpen: boolean
    onClose: () => void
    product?: any
}

export default function ProductModal({ isOpen, onClose, product }: Props) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        categoria: 'concreto',
        price_m3: 0,
        cost_m3: 0,
        descricao: ''
    })

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                categoria: product.categoria || 'concreto',
                price_m3: product.price_m3 || 0,
                cost_m3: product.cost_m3 || 0,
                descricao: product.descricao || ''
            })
        } else {
            setFormData({
                name: '',
                categoria: 'concreto',
                price_m3: 0,
                cost_m3: 0,
                descricao: ''
            })
        }
    }, [product, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = product 
                ? await updateProductAction(product.id, formData)
                : await createProductAction(formData)

            if (res.success) {
                toast.success(product ? 'Produto atualizado!' : 'Produto cadastrado!')
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
                        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
                    >
                        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                            <div>
                                <h2 className="text-xl font-black italic tracking-tighter uppercase text-white flex items-center gap-2">
                                    {product ? <Construction className="w-5 h-5 text-orange-500" /> : <Box className="w-5 h-5 text-orange-500" />}
                                    {product ? 'Editar Produto' : 'Novo Produto/Mix'}
                                </h2>
                                <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mt-1">Materiais // Engenharia de Traço</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest">Nome do Produto / Traço</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-orange-500 transition-colors"
                                        placeholder="Ex: Concreto FCK 30"
                                    />
                                </div>

                                {/* Category */}
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest">Categoria</label>
                                    <select 
                                        value={formData.categoria}
                                        onChange={e => setFormData({...formData, categoria: e.target.value as any})}
                                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-orange-500 transition-colors"
                                    >
                                        <option value="concreto">Concreto Usinado</option>
                                        <option value="manilha">Manilhas / Aduelas</option>
                                        <option value="pre-moldado">Pré-moldados</option>
                                    </select>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest text-emerald-500">Preço de Venda (m³)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <input 
                                            type="number" 
                                            required
                                            step="0.01"
                                            value={formData.price_m3}
                                            onChange={e => setFormData({...formData, price_m3: parseFloat(e.target.value) || 0})}
                                            className="w-full bg-slate-950 border border-emerald-900/30 p-3 pl-10 rounded-xl text-emerald-400 outline-none focus:border-emerald-500 transition-colors font-mono"
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>

                                {/* Cost */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest text-red-500">Custo Operacional (m³)</label>
                                    <div className="relative">
                                        <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                        <input 
                                            type="number" 
                                            required
                                            step="0.01"
                                            value={formData.cost_m3}
                                            onChange={e => setFormData({...formData, cost_m3: parseFloat(e.target.value) || 0})}
                                            className="w-full bg-slate-950 border border-red-900/30 p-3 pl-10 rounded-xl text-red-400 outline-none focus:border-red-500 transition-colors font-mono"
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block tracking-widest">Descrição Técnica / Notas</label>
                                    <textarea 
                                        value={formData.descricao}
                                        onChange={e => setFormData({...formData, descricao: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-orange-500 transition-colors min-h-[100px]"
                                        placeholder="Especificações do traço, resistência, etc..."
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 bg-slate-900/50 -mx-8 -mb-8 p-8 border-t border-slate-800">
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
                                    className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold uppercase text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-orange-600/20 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processando...' : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {product ? 'Salvar Mix' : 'Adicionar ao Mix'}
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
