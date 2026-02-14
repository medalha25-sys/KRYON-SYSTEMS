'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import ProductFormModal from '@/components/fashion/ProductFormModal';

export default function FashionProductsPage() {
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
            const { data, error } = await supabase
                .from('fashion_products')
                .select(`
                    *,
                    fashion_categories (name)
                `)
                .eq('shop_id', shop.id)
                .order('name');
            
            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setItems(data || []);
            }
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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meus Produtos</h1>
                <button 
                    onClick={handleNew}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Novo Produto
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Nome</th>
                            <th className="px-6 py-4">Marca</th>
                            <th className="px-6 py-4">Categoria</th>
                            <th className="px-6 py-4">Tamanho</th>
                            <th className="px-6 py-4">Cor</th>
                            <th className="px-6 py-4 text-right">Preço Venda</th>
                            <th className="px-6 py-4 text-right">Estoque</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan={8} className="p-8 text-center text-slate-500">Carregando produtos...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={8} className="p-8 text-center text-slate-500">Nenhum produto encontrado. Cadastre o primeiro!</td></tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        {item.name}
                                        {item.sku && <span className="block text-xs text-slate-400">{item.sku}</span>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{item.brand || '-'}</td>
                                    <td className="px-6 py-4 text-slate-500">{item.fashion_categories?.name || '-'}</td>
                                    <td className="px-6 py-4 text-slate-500">{item.size || '-'}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        <div className="flex items-center gap-2">
                                            {item.color}
                                            {/* Optional: color swatch if color is a hex code */}
                                        </div> 
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white">R$ {item.price?.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {item.stock} un
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleEdit(item)}
                                            className="text-slate-400 hover:text-purple-600 transition p-2 hover:bg-purple-50 rounded-full"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
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
