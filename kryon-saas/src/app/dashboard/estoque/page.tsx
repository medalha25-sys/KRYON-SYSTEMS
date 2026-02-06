'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ProductModal from '@/components/ProductModal';
import DamageModal from '@/components/DamageModal';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    brand: string;
}

const EstoquePage: React.FC = () => {
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [shopId, setShopId] = useState<string | null>(null);
    const supabase = createClient();

    const fetchProducts = async (currentShopId: string) => {
        setIsLoading(true);
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('shop_id', currentShopId)
            .order('created_at', { ascending: false });

        if (data) setProducts(data);
        setIsLoading(false);
    };

    useEffect(() => {
        const init = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('shop_id')
              .eq('id', user.id)
              .single();
            if (profile?.shop_id) {
              setShopId(profile.shop_id);
              fetchProducts(profile.shop_id);
            }
          }
        };
        init();
    }, []);

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
        if (shopId) fetchProducts(shopId);
    };

    const handleOpenDamageModal = (product: Product) => {
        setSelectedProduct(product);
        setIsDamageModalOpen(true);
    };

    const handleCloseDamageModal = () => {
        setIsDamageModalOpen(false);
        setSelectedProduct(null);
        if (shopId) fetchProducts(shopId);
    };

    return (
        <div className="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[#111418] dark:text-white text-3xl font-black leading-tight tracking-tight">Controle de Estoque</h1>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Gerencie seu inventário, reposições e avarias de forma centralizada.</p>
                </div>
                <button
                    onClick={() => setIsProductModalOpen(true)}
                    className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl hover:bg-primary-dark transition-all font-black text-lg shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined">add_box</span>
                    Novo Produto
                </button>
            </div>

            <div className="w-full bg-white dark:bg-[#1e2730] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm transition-all hover:shadow-md">
                <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20 flex justify-between items-center">
                    <h2 className="text-[#111418] dark:text-white text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">inventory_2</span> 
                      Itens Cadastrados ({products.length})
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full uppercase">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> 
                        {products.filter(p => p.quantity <= 3).length} Críticos
                      </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sincronizando inventário...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4 text-gray-400">
                        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-full">
                          <span className="material-symbols-outlined text-7xl opacity-20">inventory_2</span>
                        </div>
                        <div className="max-w-xs space-y-1">
                          <p className="font-black text-gray-600 dark:text-gray-300">Inventário Vazio</p>
                          <p className="text-xs leading-relaxed">Você ainda não possui produtos cadastrados em sua loja. Comece adicionando seu primeiro item.</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <tr>
                                    <th className="px-8 py-4">Produto</th>
                                    <th className="px-6 py-4">Categoria</th>
                                    <th className="px-6 py-4">Marca</th>
                                    <th className="px-6 py-4 text-right">Preço</th>
                                    <th className="px-6 py-4 text-center">Status Estoque</th>
                                    <th className="px-8 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {products.map((product) => (
                                    <tr key={product.id} className="group hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                                        <td className="px-8 py-5">
                                          <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{product.name}</span>
                                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">SKU_{product.id.slice(0,8)}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-5">
                                          <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                                            {product.category}
                                          </span>
                                        </td>
                                        <td className="px-6 py-5 text-gray-500 italic font-medium">{product.brand || '---'}</td>
                                        <td className="px-6 py-5 text-right font-black text-gray-900 dark:text-white">
                                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                              <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-tight ${product.quantity > 10
                                                  ? 'bg-green-500/10 text-green-600'
                                                  : product.quantity > 3
                                                      ? 'bg-yellow-500/10 text-yellow-600'
                                                      : 'bg-red-500/10 text-red-600 animate-pulse'
                                                  }`}>
                                                  {product.quantity > 10 ? 'Seguro' : product.quantity > 0 ? 'Baixo' : 'Esgotado'}
                                              </span>
                                              <span className="text-[10px] font-bold text-gray-400">{product.quantity} un</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => handleOpenDamageModal(product)}
                                                className="p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                title="Reportar Avaria"
                                            >
                                                <span className="material-symbols-outlined text-lg">report_problem</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ProductModal isOpen={isProductModalOpen} onClose={handleCloseProductModal} />
            <DamageModal
                isOpen={isDamageModalOpen}
                onClose={handleCloseDamageModal}
                product={selectedProduct}
            />
        </div>
    );
};

export default EstoquePage;
