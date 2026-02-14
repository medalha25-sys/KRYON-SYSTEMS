'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import ProductFormModal from '@/components/fashion/ProductFormModal';

export default function FashionStockPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<any>(null);
    const supabase = createClient();

    const fetchItems = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: shop } = await supabase
            .from('shops')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (shop) {
            const { data } = await supabase
                .from('fashion_products')
                .select(`
                    *,
                    fashion_categories (name)
                `)
                .eq('shop_id', shop.id)
                .order('name');
            setItems(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleEdit = (product: any) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setProductToEdit(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Controle de Estoque</h1>
                <button 
                    onClick={handleNew}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Novo Item
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Produto</th>
                            <th className="px-6 py-4">Ref/SKU</th>
                            <th className="px-6 py-4">Categoria</th>
                            <th className="px-6 py-4 text-right">Custo</th>
                            <th className="px-6 py-4 text-right">Venda</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan={7} className="p-8 text-center text-slate-500">Carregando estoque...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={7} className="p-8 text-center text-slate-500">Nenhum produto cadastrado.</td></tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        {item.name}
                                        <div className="text-xs text-slate-500">
                                            {item.brand} {item.model} • {item.size} • {item.color}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{item.sku || '-'}</td>
                                    <td className="px-6 py-4 text-slate-500">{item.fashion_categories?.name || '-'}</td>
                                    <td className="px-6 py-4 text-right text-slate-500">R$ {item.cost_price?.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-medium">R$ {item.price?.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {item.stock} un
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleEdit(item)}
                                            className="text-slate-400 hover:text-purple-600 transition p-2 hover:bg-purple-50 rounded-full"
                                            title="Editar / Ajustar Estoque"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ProductFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchItems}
                productToEdit={productToEdit}
            />
        </div>
    );
}
