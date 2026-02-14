'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import CategoryManager from './CategoryManager';
import { translateSupabaseError } from '@/utils/error_handling';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productToEdit?: any;
}

export default function ProductFormModal({ isOpen, onClose, onSuccess, productToEdit }: ProductFormModalProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category_id: '',
        price: '', // Sale Price
        cost_price: '', // Purchase Price
        stock: '',
        size: '',
        color: '',
        brand: '',
        model: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (productToEdit) {
                setFormData({
                    name: productToEdit.name || '',
                    sku: productToEdit.sku || '',
                    category_id: productToEdit.category_id || '',
                    price: productToEdit.price || '',
                    cost_price: productToEdit.cost_price || '',
                    stock: productToEdit.stock || '',
                    size: productToEdit.size || '',
                    color: productToEdit.color || '',
                    brand: productToEdit.brand || '',
                    model: productToEdit.model || '',
                });
            } else {
                setFormData({
                    name: '', sku: '', category_id: '', price: '', cost_price: '',
                    stock: '', size: '', color: '', brand: '', model: ''
                });
            }
        }
    }, [isOpen, productToEdit]);

    const fetchCategories = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Helper to get shop_id first
        const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
        if (!shop) return;

        const { data } = await supabase
            .from('fashion_categories')
            .select('*')
            .eq('shop_id', shop.id)
            .order('name');
        
        setCategories(data || []);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
            if (!shop) throw new Error('Loja não encontrada');

            const payload = {
                shop_id: shop.id,
                name: formData.name,
                sku: formData.sku,
                category_id: formData.category_id || null,
                price: parseFloat(formData.price) || 0,
                cost_price: parseFloat(formData.cost_price) || 0,
                stock: parseInt(formData.stock) || 0,
                size: formData.size,
                color: formData.color,
                brand: formData.brand,
                model: formData.model,
            };

            let error;
            if (productToEdit) {
                const { error: updateError } = await supabase
                    .from('fashion_products')
                    .update(payload)
                    .eq('id', productToEdit.id);
                error = updateError;
            } else {
                 const { error: insertError } = await supabase
                    .from('fashion_products')
                    .insert(payload);
                error = insertError;
            }

            if (error) throw error;

            toast.success(productToEdit ? 'Produto atualizado!' : 'Produto cadastrado!');
            onSuccess();
            onClose();

        } catch (err: any) {
            console.error(err);
            const friendlyMessage = translateSupabaseError(err);
            toast.error('Erro ao salvar produto: ' + friendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {productToEdit ? 'Editar Produto' : 'Novo Produto'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Produto *</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Ex: Camiseta Básica"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código / SKU</label>
                            <input
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="CMD-001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                            <div className="flex gap-2">
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Selecione...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryManager(true)}
                                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:brightness-90 transition"
                                    title="Gerenciar Categorias"
                                >
                                    <span className="material-symbols-outlined text-sm">settings</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preço de Custo</label>
                            <input
                                type="number"
                                step="0.01"
                                name="cost_price"
                                value={formData.cost_price}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preço de Venda *</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estoque</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Marca</label>
                            <input
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Nike"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Modelo</label>
                            <input
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Air Max"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cor</label>
                            <input
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                list="color-options"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Selecione ou digite..."
                            />
                            <datalist id="color-options">
                                {['Preto', 'Branco', 'Cinza', 'Azul Marinho', 'Azul Royal', 'Azul Claro', 
                                  'Vermelho', 'Vinho', 'Amarelo', 'Verde Militar', 'Verde Bandeira', 'Verde Água',
                                  'Rosa Pink', 'Rosa Bebê', 'Roxo', 'Lilás', 'Laranja', 'Marrom', 'Bege', 'Nude',
                                  'Dourado', 'Prateado', 'Bronze', 'Estampado', 'Listrado', 'Xadrez'].map(c => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tamanho</label>
                            <input
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                list="size-options"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Selecione ou digite..."
                            />
                            <datalist id="size-options">
                                {['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'EXG', 'EXGG', 'Único'].map(s => (
                                    <option key={s} value={s} />
                                ))}
                                {Array.from({ length: 50 }, (_, i) => i + 1).map(n => (
                                    <option key={n} value={String(n).padStart(2, '0')} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-70 flex items-center gap-2"
                        >
                            {loading ? 'Salvando...' : 'Salvar Produto'}
                        </button>
                    </div>
                </form>
            </div>

            {showCategoryManager && (
                <CategoryManager
                    onClose={() => setShowCategoryManager(false)}
                    onCategoryAdded={() => {
                        fetchCategories();
                        // Optional: select new category automatically
                    }}
                />
            )}
        </div>
    );
}
