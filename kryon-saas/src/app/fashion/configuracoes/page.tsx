'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function FashionSettingsPage() {
    const [shop, setShop] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Employee State
    const [employees, setEmployees] = useState<any[]>([]);
    const [newEmployee, setNewEmployee] = useState({ name: '', role: 'vendedor', password: '', email: '' });
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('shops')
                .select('*')
                .eq('owner_id', user.id)
                .single();
            
            setShop(data);

            if (data) {
                fetchEmployees(data.id);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const fetchEmployees = async (shopId: string) => {
        const { data } = await supabase
            .from('fashion_employees')
            .select('*')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false });
        setEmployees(data || []);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase
            .from('shops')
            .update({
                name: shop.name,
            })
            .eq('id', shop.id);

        if (error) {
            toast.error('Erro ao salvar configurações.');
            console.error(error);
        } else {
            toast.success('Configurações salvas com sucesso!');
        }
        setSaving(false);
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shop) return;
        setLoadingEmployees(true);

        try {
            const { data, error } = await supabase
                .from('fashion_employees')
                .insert({
                    shop_id: shop.id,
                    name: newEmployee.name,
                    role: newEmployee.role,
                    password: newEmployee.password,
                    email: newEmployee.email
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('Colaborador adicionado!');
            setEmployees([data, ...employees]);
            setNewEmployee({ name: '', role: 'vendedor', password: '', email: '' });
        } catch (error) {
            console.error(error);
            toast.error('Erro ao adicionar colaborador.');
        } finally {
            setLoadingEmployees(false);
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('Remover este colaborador?')) return;

        const { error } = await supabase
            .from('fashion_employees')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Erro ao remover.');
        } else {
            toast.success('Colaborador removido.');
            setEmployees(employees.filter(e => e.id !== id));
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando configurações...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Configurações da Loja</h1>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <form onSubmit={handleSave} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Nome da Loja
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={shop?.name || ''}
                                    onChange={(e) => setShop({ ...shop, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Slug (Endereço da Loja)
                                </label>
                                <input
                                    type="text"
                                    value={shop?.slug || ''}
                                    disabled
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-70 flex items-center gap-2"
                            >
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Collaborators Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Colaboradores e Acessos</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Form */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 h-fit">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Novo Colaborador</h3>
                        <form onSubmit={handleAddEmployee} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Nome</label>
                                <input
                                    required
                                    value={newEmployee.name}
                                    onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Nome completo"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Email (Opcional)</label>
                                <input
                                    type="email"
                                    value={newEmployee.email}
                                    onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Função / Cargo</label>
                                <select
                                    value={newEmployee.role}
                                    onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="vendedor">Vendedor</option>
                                    <option value="gerente">Gerente</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Senha de Acesso</label>
                                <input
                                    type="password"
                                    required
                                    value={newEmployee.password}
                                    onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="******"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loadingEmployees}
                                className="w-full py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition disabled:opacity-50"
                            >
                                {loadingEmployees ? 'Adicionando...' : 'Adicionar Colaborador'}
                            </button>
                        </form>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-medium border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4">Nome</th>
                                        <th className="px-6 py-4">Função</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {employees.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500">
                                                Nenhum colaborador cadastrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        employees.map((emp) => (
                                            <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                    {emp.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                        emp.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        emp.role === 'gerente' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {emp.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{emp.email || '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteEmployee(emp.id)}
                                                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                                                        title="Remover"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
