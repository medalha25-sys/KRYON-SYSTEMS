'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, Search, Plus, Filter, MoreVertical, Printer, Eye, PenTool } from 'lucide-react';
import ServiceOrderModal from '@/components/ServiceOrderModal';

export default function ServicosPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [techFilter, setTechFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('shop_id')
                .eq('id', user.id)
                .single();

            if (profile?.shop_id) {
                const { data } = await supabase
                    .from('service_orders')
                    .select('*')
                    .eq('shop_id', profile.shop_id)
                    .order('created_at', { ascending: false });

                if (data) setOrders(data);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.device_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.device_imei?.includes(searchTerm) ||
            order.id.toString().includes(searchTerm);
            
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesTech = techFilter === 'all' || order.technician === techFilter;
        
        return matchesSearch && matchesStatus && matchesTech;
    });

    const technicians = Array.from(new Set(orders.map(o => o.technician).filter(Boolean)));

    const getStatusBadge = (status: string) => {
        const styles: any = {
            'analysis': 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
            'waiting_parts': 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
            'in_progress': 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
            'finished': 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
            'delivered': 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400',
            'cancelled': 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        };

        const labels: any = {
            'analysis': 'Em Análise',
            'waiting_parts': 'Aguard. Peças',
            'in_progress': 'Em Conserto',
            'finished': 'Finalizado',
            'delivered': 'Entregue',
            'cancelled': 'Cancelado',
        };

        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${styles[status] || styles.analysis}`}>
                {labels[status] || 'Pendente'}
            </span>
        );
    };

    return (
        <div className="p-6 md:p-8 lg:px-12 max-w-[1600px] mx-auto flex flex-col gap-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-[#111418] dark:text-white tracking-tight">Ordens de Serviço</h2>
                    <p className="text-[#617589] dark:text-gray-400 mt-1">Gerencie manutenções e reparos técnicos.</p>
                </div>
                <button 
                    onClick={() => {
                        setSelectedOrder(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={20} />
                    Nova Ordem de Serviço
                </button>
            </header>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Em Aberto', value: orders.filter(o => ['analysis', 'in_progress', 'waiting_parts'].includes(o.status)).length, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                    { label: 'Finalizadas', value: orders.filter(o => o.status === 'finished').length, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10' },
                    { label: 'Entregues', value: orders.filter(o => o.status === 'delivered').length, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/10' },
                    { label: 'Total Mês', value: orders.length, color: 'text-primary', bg: 'bg-primary/5 dark:bg-primary/10' },
                ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-2xl ${stat.bg} flex flex-col gap-1`}>
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</span>
                        <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* List Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar por cliente, modelo ou IMEI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-white dark:bg-[#1e2730] border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:border-primary transition-all dark:text-white"
                    />
                </div>
                <div className="flex gap-2">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-12 px-4 bg-white dark:bg-[#1e2730] border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-500 outline-none focus:border-primary transition-all"
                    >
                        <option value="all">Todos Status</option>
                        <option value="analysis">Em Análise</option>
                        <option value="in_progress">Em Conserto</option>
                        <option value="finished">Finalizado</option>
                        <option value="delivered">Entregue</option>
                    </select>
                    <select 
                        value={techFilter}
                        onChange={(e) => setTechFilter(e.target.value)}
                        className="h-12 px-4 bg-white dark:bg-[#1e2730] border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-500 outline-none focus:border-primary transition-all"
                    >
                        <option value="all">Todos Técnicos</option>
                        {technicians.map((tech: any) => (
                            <option key={tech} value={tech}>{tech}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="bg-white dark:bg-[#1e2730] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente / Dispositivo</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status / Entrada</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Técnico</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Est.</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                                        Carregando ordens de serviço...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <p className="font-medium">Nenhuma ordem de serviço encontrada.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#111418] dark:text-white">{order.client_name}</span>
                                                <span className="text-xs text-gray-500">{order.device_brand} {order.device_model}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                {getStatusBadge(order.status)}
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {format(new Date(order.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{order.technician || '--'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-primary">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.estimated_cost)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedOrder(order);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                    title="Visualizar/Editar"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedOrder(order);
                                                        setIsModalOpen(true);
                                                        // Future: directly open in preview mode? 
                                                        // For now, modal handles it.
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                                                    title="Imprimir Comprovante"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <ServiceOrderModal 
                    isOpen={isModalOpen} 
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedOrder(null);
                        loadOrders(); // Refresh table
                    }}
                    order={selectedOrder}
                />
            )}
        </div>
    );
}
