'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createConcreteQuote } from '../../actions'
import { 
    Calculator, 
    Truck, 
    TrendingUp, 
    FileCheck, 
    XCircle, 
    Clock, 
    Search,
    User,
    Box,
    MapPin,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SignatureCanvas from './SignatureCanvas'
import ClientModal from '../../clientes/ClientModal'
import ProductModal from '../../produtos/ProductModal'
import { getClients, getProducts } from '../../actions'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Props {
    clients: any[]
    products: any[]
}

export default function SmartQuoteForm({ clients: initialClients, products: initialProducts }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState(initialClients)
    const [products, setProducts] = useState(initialProducts)
    const [isClientModalOpen, setIsClientModalOpen] = useState(false)
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        client_id: '',
        product_id: '',
        length: 0,
        width: 0,
        height: 0,
        unit_price: 0,
        km: 0,
        km_rate: 0,
        status: 'pendente' as any,
        loss_reason: '',
        notes: '',
        signature_base64: ''
    })

    const [results, setResults] = useState({
        volume_m3: 0,
        freight_value: 0,
        total: 0,
        profit: 0
    })

    // Real-time Calculation Engine
    useEffect(() => {
        const volume = formData.length * formData.width * formData.height
        const freight = formData.km * formData.km_rate
        
        const selectedProduct = products.find(p => p.id === formData.product_id)
        const cost_m3 = selectedProduct?.cost_m3 || 0
        const base_price = formData.unit_price || selectedProduct?.price_m3 || 0

        const subtotal = volume * base_price
        const total = subtotal + freight
        const profit = volume * (base_price - cost_m3)

        setResults({
            volume_m3: volume,
            freight_value: freight,
            total: total,
            profit: profit
        })
    }, [formData, products])

    // Auto-update price when product changes
    useEffect(() => {
        if (formData.product_id) {
            const product = products.find(p => p.id === formData.product_id)
            if (product) {
                setFormData(prev => ({ ...prev, unit_price: product.price_m3 }))
            }
        }
    }, [formData.product_id, products])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'client_id' || name === 'product_id' || name === 'status' || name === 'loss_reason' || name === 'notes') 
                ? value 
                : parseFloat(value) || 0
        }))
    }

    const generatePDF = (quoteData: any) => {
        const doc = new jsPDF()
        const client = clients.find(c => c.id === quoteData.client_id)
        const product = products.find(p => p.id === quoteData.product_id)

        // Title
        doc.setFontSize(22)
        doc.setTextColor(15, 23, 42) // Slate-900
        doc.text('CONCRETE ERP BRASIL', 105, 20, { align: 'center' })
        
        doc.setFontSize(10)
        doc.text('PROPOSTA TÉCNICA COMERCIAL', 105, 28, { align: 'center' })

        // Info Table
        const tableBody = [
            ['CLIENTE', client?.name || '---'],
            ['PRODUTO (TRAÇO)', product?.name || '---'],
            ['VOLUME CALCULADO', `${results.volume_m3.toFixed(3)} m³`],
            ['LOGÍSTICA (KM)', `${formData.km} km`],
            ['VALOR FRETE', `R$ ${results.freight_value.toFixed(2)}`],
            ['PREÇO UNITÁRIO', `R$ ${formData.unit_price.toFixed(2)}/m³`],
            ['VALOR TOTAL', `R$ ${results.total.toFixed(2)}`],
            ['STATUS', formData.status.toUpperCase()],
            ['DATA', new Date().toLocaleDateString()]
        ]

        // @ts-ignore
        autoTable(doc, {
            startY: 40,
            head: [['ITEM', 'DETALHES']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] }
        })

        if (formData.signature_base64) {
             const finalY = (doc as any).lastAutoTable.finalY || 150
             doc.text('ASSINATURA DIGITAL:', 14, finalY + 20)
             doc.addImage(formData.signature_base64, 'PNG', 14, finalY + 25, 60, 20)
        }

        doc.save(`proposta_${client?.name || 'sem_nome'}.pdf`)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await createConcreteQuote(formData)
            if (res.success) {
                toast.success('Orçamento gerado e salvo com sucesso!')
                generatePDF(formData)
                router.push('/concrete/orcamentos')
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error('Ocorreu um erro ao salvar')
        } finally {
            setLoading(false)
        }
    }

    const handleClientAdded = async () => {
        const updatedClients = await getClients()
        setClients(updatedClients)
    }

    const handleProductAdded = async () => {
        const updatedProducts = await getProducts()
        setProducts(updatedProducts)
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Left: Input Sections */}
            <div className="xl:col-span-8 space-y-6">
                
                {/* 1. Entity Selection */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg"><User className="w-4 h-4 text-blue-400" /></div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Dados da Entidade</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Cliente Solicitante</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <select 
                                    name="client_id" 
                                    value={formData.client_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-blue-500 transition-all appearance-none"
                                >
                                    <option value="">Selecione o Cliente</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                                </select>
                                <button 
                                    type="button"
                                    onClick={() => setIsClientModalOpen(true)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-4 text-blue-500 hover:text-blue-400 bg-slate-900 border-l border-slate-800 rounded-r-xl transition-colors flex items-center justify-center"
                                    title="Cadastrar Novo Cliente"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="font-black text-lg ml-0.5">+</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Traço de Concreto (Produto)</label>
                            <div className="relative">
                                <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <select 
                                    name="product_id" 
                                    value={formData.product_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-blue-500 transition-all appearance-none"
                                >
                                    <option value="">Selecione o Traço</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <button 
                                    type="button"
                                    onClick={() => setIsProductModalOpen(true)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-4 text-orange-500 hover:text-orange-400 bg-slate-900 border-l border-slate-800 rounded-r-xl transition-colors flex items-center justify-center"
                                    title="Cadastrar Novo Traço/Produto"
                                >
                                    <Box className="w-4 h-4" />
                                    <span className="font-black text-lg ml-0.5">+</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Dimensions & Volume */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/10 rounded-lg"><Calculator className="w-4 h-4 text-purple-400" /></div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Engenharia de Volume (Calculadora ABNT)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Comp. (m)</label>
                            <input type="number" name="length" step="0.01" value={formData.length || ''} onChange={handleChange} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-purple-500 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Larg. (m)</label>
                            <input type="number" name="width" step="0.01" value={formData.width || ''} onChange={handleChange} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-purple-500 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Alt./Esp. (m)</label>
                            <input type="number" name="height" step="0.01" value={formData.height || ''} onChange={handleChange} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-purple-500 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Resultado m³</label>
                            <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-sm font-black text-white font-mono flex items-center justify-center">
                                {results.volume_m3.toFixed(3)} m³
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Freight & Pricing */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-500/10 rounded-lg"><Truck className="w-4 h-4 text-orange-400" /></div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Logística e Comercial</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Distância (km)</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type="number" name="km" step="0.1" value={formData.km || ''} onChange={handleChange} placeholder="0.0" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-orange-500 transition-all" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Taxa KM (R$)</label>
                            <input type="number" name="km_rate" step="0.01" value={formData.km_rate || ''} onChange={handleChange} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-orange-500 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Preço/m³ Venda (R$)</label>
                            <input type="number" name="unit_price" step="0.01" value={formData.unit_price || ''} onChange={handleChange} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-emerald-500 text-emerald-400 font-bold transition-all" />
                        </div>
                    </div>
                </div>

                {/* 4. Extra: Signature & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500/10 rounded-lg"><FileCheck className="w-4 h-4 text-emerald-400" /></div>
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Assinatura Digital</h2>
                        </div>
                        <SignatureCanvas onSave={(base64) => setFormData(p => ({ ...p, signature_base64: base64 }))} />
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Observações Internas</h2>
                        </div>
                        <textarea 
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Notas técnicas sobre a entrega, acesso de caminhão, etc..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:border-blue-500 transition-all resize-none h-[150px]"
                        />
                    </div>
                </div>
            </div>

            {/* Right: Summary & Action */}
            <div className="xl:col-span-4 space-y-6 sticky top-8">
                {/* Finance Summary Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase opacity-60 tracking-[0.2em] mb-2">Total da Proposta</p>
                        <h3 className="text-5xl font-black italic tracking-tighter mb-8">R$ {results.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10 mb-8">
                            <div>
                                <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Volume</p>
                                <p className="text-xl font-bold font-mono">{results.volume_m3.toFixed(3)} m³</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Total Frete</p>
                                <p className="text-xl font-bold font-mono">R$ {results.freight_value.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <span className="text-[10px] font-bold uppercase">Meta de Lucro Est.</span>
                            </div>
                            <span className="text-xl font-black font-mono">R$ {results.profit.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                </div>

                {/* Workflow Status */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Status da Negociação</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'pendente', label: 'Pendente', icon: Clock, color: 'text-slate-400' },
                                    { id: 'negociacao', label: 'Em Negociação', icon: TrendingUp, color: 'text-blue-400' },
                                    { id: 'fechado', label: 'Fechado/Ganho', icon: CheckCircle2, color: 'text-emerald-400' },
                                    { id: 'perdido', label: 'Perdor/Perdido', icon: XCircle, color: 'text-red-400' },
                                ].map(st => (
                                    <button
                                        key={st.id}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, status: st.id }))}
                                        className={`flex items-center gap-2 p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                                            formData.status === st.id 
                                            ? 'bg-slate-800 border-blue-500 text-white' 
                                            : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
                                        }`}
                                    >
                                        <st.icon className={`w-3.3 h-3.3 ${formData.status === st.id ? st.color : 'text-slate-700'}`} />
                                        {st.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence>
                            {formData.status === 'perdido' && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden space-y-2"
                                >
                                    <label className="text-[10px] font-bold uppercase text-red-500 ml-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Motivo da Perda
                                    </label>
                                    <textarea 
                                        name="loss_reason"
                                        value={formData.loss_reason}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                        placeholder="Ex: Preço do concorrente menor, prazo excedido..."
                                        className="w-full bg-red-500/5 border border-red-900/20 rounded-xl p-3 text-sm focus:border-red-500 transition-all resize-none"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Final Action */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-white hover:bg-slate-200 text-slate-950 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-white/5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                    ) : (
                        <>
                            <FileCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Finalizar e Download PDF
                        </>
                    )}
                </button>

                <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-tight">
                    Ao salvar, este orçamento será vinculado permanentemente à organização e as entregas serão programadas automaticamente caso o status seja "FECHADO".
                </p>
            </div>
            </form>

            <ClientModal 
                isOpen={isClientModalOpen}
                onClose={() => {
                    setIsClientModalOpen(false)
                    handleClientAdded()
                }}
            />

            <ProductModal 
                isOpen={isProductModalOpen}
                onClose={() => {
                    setIsProductModalOpen(false)
                    handleProductAdded()
                }}
            />
        </>
    )
}
