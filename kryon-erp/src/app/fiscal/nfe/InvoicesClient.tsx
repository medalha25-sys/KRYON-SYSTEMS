'use client'

import React, { useState } from 'react'
import { 
    FileText, 
    Download, 
    XCircle, 
    CheckCircle2, 
    Search,
    Eye,
    Receipt,
    AlertCircle,
    Printer,
    ArrowUpRight
} from 'lucide-react'
import { cancelarNFeAction } from '../../actions'
import { toast } from 'sonner'

export default function InvoicesClient({ initialData }: { initialData: any[] }) {
    const [invoices, setInvoices] = useState(initialData)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredInvoices = invoices.filter(inv => 
        inv.numero_nota.toString().includes(searchTerm) ||
        inv.erp_clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCancel = async (id: string) => {
        if (!confirm('Deseja realmente cancelar esta NF-e?')) return
        
        const res = await cancelarNFeAction(id)
        if (res.success) {
            toast.success('NF-e cancelada com sucesso')
            setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'cancelada' } : inv))
        } else {
            toast.error(res.error)
        }
    }

    const downloadXML = (invoice: any) => {
        const element = document.createElement("a")
        const file = new Blob([invoice.xml_gerado], {type: 'text/xml'})
        element.href = URL.createObjectURL(file)
        element.download = `NFe_${invoice.numero_nota}.xml`
        document.body.appendChild(element)
        element.click()
        toast.success('XML gerado para download')
    }

    const viewDANFE = (invoice: any) => {
        toast.info('Visualização de DANFE simulada')
        // In a real app, this would open a PDF or a printable route
    }

    return (
        <div className="space-y-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
                    <p className="text-[10px] font-black uppercase text-neutral-500 mb-1">Notas Emitidas</p>
                    <h3 className="text-2xl font-black text-white">{invoices.filter(i => i.status === 'emitida').length}</h3>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
                    <p className="text-[10px] font-black uppercase text-neutral-500 mb-1">Total Impostos (Simulado)</p>
                    <h3 className="text-2xl font-black text-emerald-500">
                        R$ {invoices.reduce((acc, curr) => acc + (curr.status === 'emitida' ? Number(curr.valor_icms) + Number(curr.valor_iss) : 0), 0).toLocaleString('pt-BR')}
                    </h3>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
                    <p className="text-[10px] font-black uppercase text-neutral-500 mb-1">Notas Canceladas</p>
                    <h3 className="text-2xl font-black text-red-500">{invoices.filter(i => i.status === 'cancelada').length}</h3>
                </div>
            </div>

            {/* Actions / Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input 
                        type="text"
                        placeholder="Buscar por número ou cliente..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-blue-500 transition-colors outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-800 bg-black/20">
                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Número/Série</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Cliente</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Valor Total</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Data Emissão</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Status</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-neutral-500 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Receipt className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white leading-none mb-1">{invoice.numero_nota}</p>
                                                <p className="text-[10px] text-neutral-500 uppercase font-mono">Série {invoice.serie}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <p className="text-sm font-medium text-slate-300 uppercase">{invoice.erp_clients?.name}</p>
                                        <p className="text-[10px] text-neutral-500 uppercase font-bold">Pedido: #{invoice.erp_orders?.id?.slice(0,8)}</p>
                                    </td>
                                    <td className="p-5">
                                        <p className="text-sm font-black text-white font-mono" suppressHydrationWarning>R$ {Number(invoice.valor_total).toLocaleString('pt-BR')}</p>
                                        <p className="text-[9px] text-emerald-500 uppercase font-bold tracking-tighter" suppressHydrationWarning>
                                            ICMS: R$ {Number(invoice.valor_icms).toLocaleString('pt-BR')}
                                        </p>
                                    </td>
                                    <td className="p-5">
                                        <p className="text-sm text-slate-400" suppressHydrationWarning>{new Date(invoice.created_at).toLocaleDateString('pt-BR')}</p>
                                        <p className="text-[10px] text-neutral-600 font-mono italic" suppressHydrationWarning>{new Date(invoice.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            invoice.status === 'emitida' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                            {invoice.status === 'emitida' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => viewDANFE(invoice)}
                                                className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-400 hover:text-white transition-all shadow-lg"
                                                title="Ver DANFE"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => downloadXML(invoice)}
                                                className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-400 hover:text-white transition-all shadow-lg"
                                                title="Download XML"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            {invoice.status === 'emitida' && (
                                                <button 
                                                    onClick={() => handleCancel(invoice.id)}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all shadow-lg"
                                                    title="Cancelar Nota"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
