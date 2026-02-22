'use client'

import React, { useState } from 'react'
import { createDeliveryAction } from '../../actions'
import { 
    ArrowLeft, 
    Navigation, 
    Truck, 
    User, 
    Box, 
    CheckCircle2,
    Factory
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
    productionOrder: any
    trucks: any[]
    drivers: any[]
}

export default function NewDeliveryClient({ productionOrder, trucks, drivers }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        
        const formData = new FormData(e.currentTarget)
        const data = {
            ordem_producao_id: productionOrder.id,
            caminhao_id: formData.get('caminhao_id'),
            motorista_id: formData.get('motorista_id'),
            volume_transportado_m3: parseFloat(formData.get('volume_transportado_m3') as string),
            data_saida: new Date().toISOString()
        }

        const res = await createDeliveryAction(data)
        setLoading(false)

        if (res.success) {
            toast.success('Carga despachada com sucesso!')
            router.push('/concrete/entregas')
        } else {
            toast.error(res.error || 'Erro ao despachar carga')
        }
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 flex items-center gap-6">
                    <Link 
                        href="/concrete/producao" 
                        className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-emerald-500 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Despacho de Carga</h1>
                        <p className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">Fluxo Logístico de Saída // Usina de Concreto</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Resumo da Produção */}
                    <div className="space-y-6">
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-6">
                                <Factory className="w-5 h-5 text-orange-500" />
                                <h3 className="text-sm font-black uppercase text-neutral-500 tracking-widest">Item Produzido</h3>
                            </div>
                            
                            <h2 className="text-3xl font-black text-white uppercase italic leading-none mb-2">
                                {productionOrder.erp_products?.name}
                            </h2>
                            <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-8">
                                Pedido #{productionOrder.erp_orders?.numero_pedido}
                            </p>

                            <div className="bg-black/50 p-6 rounded-2xl border border-neutral-800">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">Volume para Transporte</p>
                                <p className="text-4xl font-black text-emerald-500 font-mono italic">
                                    {Number(productionOrder.quantidade_m3).toFixed(3)} <span className="text-sm opacity-50">m³</span>
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-900/10 rounded-2xl border border-emerald-500/20 flex gap-4">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <p className="text-[10px] text-emerald-300 leading-relaxed uppercase font-bold tracking-tight">
                                A produção deste item foi finalizada e validada. Agora você deve designar o veículo e o motorista para a entrega.
                            </p>
                        </div>
                    </div>

                    {/* Formulário de Despacho */}
                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block tracking-widest flex items-center gap-2">
                                    <Truck className="w-3 h-3" /> Selecionar Veículo
                                </label>
                                <select 
                                    name="caminhao_id" 
                                    className="w-full bg-black border border-neutral-800 p-4 rounded-xl text-sm text-white focus:border-emerald-500 outline-none appearance-none" 
                                    required
                                >
                                    <option value="">Selecione um caminhão...</option>
                                    {trucks.filter(t => t.status === 'ativo').map(t => (
                                        <option key={t.id} value={t.id}>{t.placa} - {t.modelo} ({t.capacidade_m3}m³)</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block tracking-widest flex items-center gap-2">
                                    <User className="w-3 h-3" /> Selecionar Motorista
                                </label>
                                <select 
                                    name="motorista_id" 
                                    className="w-full bg-black border border-neutral-800 p-4 rounded-xl text-sm text-white focus:border-emerald-500 outline-none appearance-none" 
                                    required
                                >
                                    <option value="">Selecione um motorista...</option>
                                    {drivers.filter(d => d.status === 'ativo').map(d => (
                                        <option key={d.id} value={d.id}>{d.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block tracking-widest flex items-center gap-2">
                                    <Box className="w-3 h-3" /> Volume Real Carregado (m³)
                                </label>
                                <input 
                                    name="volume_transportado_m3" 
                                    type="number" 
                                    step="0.001" 
                                    defaultValue={productionOrder.quantidade_m3}
                                    className="w-full bg-black border border-neutral-800 p-4 rounded-xl text-sm text-white focus:border-emerald-500 outline-none font-mono" 
                                    required 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-black p-5 rounded-2xl text-xs font-black uppercase tracking-widest transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                <Navigation className="w-5 h-5 fill-black" /> {loading ? 'Despachando...' : 'Confirmar Saída da Carga'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
