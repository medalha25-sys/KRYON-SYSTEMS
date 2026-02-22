'use client'

import React, { useState, useEffect } from 'react'
import { createConcreteQuote } from '../actions'
import { Calculator, Save, AlertCircle } from 'lucide-react'

interface Props {
    clients: any[]
    products: any[]
}

export default function QuoteFormClient({ clients, products }: Props) {
    const [formData, setFormData] = useState({
        client_id: '',
        product_id: '',
        length: 0,
        width: 0,
        height: 0,
        unit_price: 0,
        km: 0,
        km_rate: 0
    })

    const [results, setResults] = useState({
        volume_m3: 0,
        freight_value: 0,
        total: 0,
        profit: 0
    })

    useEffect(() => {
        const volume = formData.length * formData.width * formData.height
        const freight = formData.km * formData.km_rate
        
        const selectedProduct = products.find(p => p.id === formData.product_id)
        const cost_m3 = selectedProduct?.cost_m3 || 0
        const price_m3 = formData.unit_price || selectedProduct?.price_m3 || 0

        const total = (volume * price_m3) + freight
        const profit = volume * (price_m3 - cost_m3)

        setResults({
            volume_m3: volume,
            freight_value: freight,
            total: total,
            profit: profit
        })
    }, [formData, products])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('id') ? value : parseFloat(value) || 0
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await createConcreteQuote(formData)
        if (res.success) {
            alert('Orçamento criado com sucesso!')
            window.location.reload()
        } else {
            alert('Erro: ' + res.error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg shadow-2xl space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <Calculator className="w-5 h-5 text-orange-500" />
                    <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-neutral-400">Calculadora de Carga</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Cliente</label>
                        <select 
                            name="client_id" 
                            onChange={handleChange} 
                            required 
                            className="w-full bg-black border border-neutral-800 p-3 rounded text-sm focus:border-orange-500 outline-none transition"
                        >
                            <option value="">Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Produto (Traço)</label>
                        <select 
                            name="product_id" 
                            onChange={handleChange} 
                            required 
                            className="w-full bg-black border border-neutral-800 p-3 rounded text-sm focus:border-orange-500 outline-none transition"
                        >
                            <option value="">Selecione um produto</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Ref: R$ {p.price_m3}/m³)</option>)}
                        </select>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-neutral-800 md:col-span-2">
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Dimensões da Peça (Metros)</p>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[10px] text-neutral-600 mb-1">Comprimento</label>
                                <input type="number" name="length" step="0.01" onChange={handleChange} className="w-full bg-black border border-neutral-800 p-2 rounded text-sm text-center" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-neutral-600 mb-1">Largura</label>
                                <input type="number" name="width" step="0.01" onChange={handleChange} className="w-full bg-black border border-neutral-800 p-2 rounded text-sm text-center" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-neutral-600 mb-1">Altura</label>
                                <input type="number" name="height" step="0.01" onChange={handleChange} className="w-full bg-black border border-neutral-800 p-2 rounded text-sm text-center" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-neutral-800 md:col-span-2">
                         <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Logística e Preço</p>
                         <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[10px] text-neutral-600 mb-1">Preço/m³</label>
                                <input type="number" name="unit_price" step="0.01" onChange={handleChange} className="w-full bg-black border border-neutral-800 p-2 rounded text-sm font-bold text-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-neutral-600 mb-1">Distância (KM)</label>
                                <input type="number" name="km" step="0.1" onChange={handleChange} className="w-full bg-black border border-neutral-800 p-2 rounded text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-neutral-600 mb-1">Taxa KM</label>
                                <input type="number" name="km_rate" step="0.01" onChange={handleChange} className="w-full bg-black border border-neutral-800 p-2 rounded text-sm" />
                            </div>
                         </div>
                    </div>
                </div>

                <button type="submit" className="w-full bg-white text-black font-black uppercase text-xs py-4 rounded hover:bg-neutral-200 transition flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Gerar e Salvar Orçamento
                </button>
            </div>

            {/* Results Preview */}
            <div className="flex flex-col gap-4">
                <div className="bg-orange-600 p-8 rounded-lg text-black flex flex-col justify-between h-full shadow-2xl">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Resumo da Proposta</p>
                        <h3 className="text-5xl font-black italic tracking-tighter uppercase mb-8">R$ {results.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        
                        <div className="grid grid-cols-2 gap-8 border-t border-black/10 pt-8">
                            <div>
                                <p className="text-[10px] font-bold uppercase opacity-60">Volume Total</p>
                                <p className="text-2xl font-black font-mono">{results.volume_m3.toFixed(3)} m³</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase opacity-60">Valor Frete</p>
                                <p className="text-2xl font-black font-mono">R$ {results.freight_value.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/10 p-4 rounded mt-8 flex items-center justify-between border border-black/5">
                        <span className="text-[10px] font-bold uppercase">Lucro Estimado Operacional</span>
                        <span className="text-xl font-black font-mono">R$ {results.profit.toFixed(2)}</span>
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-neutral-600 shrink-0 mt-1" />
                    <p className="text-xs text-neutral-400 leading-relaxed italic">
                        Os cálculos acima seguem as normas da ABNT para volume de concreto. O lucro é baseado no custo cadastrado no traço selecionado.
                    </p>
                </div>
            </div>
        </form>
    )
}
