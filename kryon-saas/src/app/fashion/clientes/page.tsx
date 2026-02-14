'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import ClientModal from '@/components/fashion/ClientModal';
import { deleteClientAction } from '@/app/fashion/clientes/actions';
import { FashionCustomer } from '@/types/fashion';
import { toast } from 'sonner';

export default function FashionClientsPage() {
    const [clients, setClients] = useState<FashionCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<FashionCustomer | null>(null);
    const supabase = createClient();

    const fetchClients = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: shop } = await supabase
            .from('shops')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (shop) {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('shop_id', shop.id)
                .order('name');
            
            if (!error) {
                setClients(data as FashionCustomer[] || []);
            } else {
                console.log('Error fetching clients:', error);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleOpenModal = (client: FashionCustomer | null = null) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        fetchClients(); // Refresh list after close
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            const res = await deleteClientAction(id);
            if (res.error) {
    // @ts-ignore
                toast.error(res.error);
            } else {
    // @ts-ignore
                toast.success('Cliente excluído com sucesso');
                fetchClients();
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clientes</h1>
                <button 
                    onClick={() => handleOpenModal(null)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 shadow-lg shadow-purple-600/20"
                >
                    <span className="material-symbols-outlined">person_add</span>
                    Novo Cliente
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Nome</th>
                            <th className="px-6 py-4">E-mail</th>
                            <th className="px-6 py-4">Telefone</th>
                            <th className="px-6 py-4">Cidade</th>
                            <th className="px-6 py-4 text-right">Compras</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">Carregando clientes...</td></tr>
                        ) : clients.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhum cliente cadastrado.</td></tr>
                        ) : (
                            clients.map((client) => (
                                <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{client.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{client.email || '-'}</td>
                                    <td className="px-6 py-4 text-slate-500">{client.phone || '-'}</td>
                                    <td className="px-6 py-4 text-slate-500">{client.city || '-'}</td>
                                    <td className="px-6 py-4 text-right font-medium text-purple-600">{client.total_orders || 0}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(client)}
                                                className="text-slate-400 hover:text-purple-600 transition p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(client.id)}
                                                className="text-slate-400 hover:text-red-600 transition p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                                title="Excluir"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ClientModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                client={editingClient}
            />
        </div>
    );
}
