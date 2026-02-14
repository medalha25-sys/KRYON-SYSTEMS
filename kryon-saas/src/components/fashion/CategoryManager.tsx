'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { translateSupabaseError } from '@/utils/error_handling';

interface Category {
    id: string;
    name: string;
}

interface CategoryManagerProps {
    onClose: () => void;
    onCategoryAdded?: (category: Category) => void;
}

export default function CategoryManager({ onClose, onCategoryAdded }: CategoryManagerProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const supabase = createClient();

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const timeout = setTimeout(() => {
            if (isMounted && loading) {
                setLoading(false);
                setErrorMsg('Tempo limite excedido. Tente novamente.');
            }
        }, 8000);

        fetchCategories().then(() => {
            if (isMounted) clearTimeout(timeout);
        });

        return () => {
             isMounted = false;
             clearTimeout(timeout);
        };
    }, []);

    const fetchCategories = async () => {
        try {
            setErrorMsg(null);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setErrorMsg("Usuário não autenticado.");
                return;
            }

            const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
            if (!shop) {
                setErrorMsg("Loja não encontrada.");
                return;
            }

            const { data, error } = await supabase
                .from('fashion_categories')
                .select('*')
                .eq('shop_id', shop.id)
                .order('name');
            
            if (error) {
                console.error("Fetch Error:", error);
                setErrorMsg("Erro ao buscar categorias: " + translateSupabaseError(error));
            } else {
                setCategories(data || []);
            }
        } catch (err: any) {
            console.error("Fetch Exception:", err);
            setErrorMsg("Erro inesperado: " + (err.message || String(err)));
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        setSubmitting(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
        if (!shop) {
             toast.error('Loja não encontrada.');
             return;
        }

        const { data, error } = await supabase
            .from('fashion_categories')
            .insert({
                shop_id: shop.id,
                name: newCategoryName.trim()
            })
            .select()
            .single();

        if (error) {
            toast.error('Erro ao adicionar categoria: ' + translateSupabaseError(error));
            console.error(error);
        } else {
            toast.success('Categoria adicionada!');
            setCategories([...categories, data]);
            setNewCategoryName('');
            if (onCategoryAdded) onCategoryAdded(data);
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

        const { error } = await supabase
            .from('fashion_categories')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Erro ao excluir categoria: ' + translateSupabaseError(error));
        } else {
            toast.success('Categoria removida.');
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    const handleGenerateDefaults = async () => {
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
            if (!shop) throw new Error("Loja não encontrada");

            const defaultCategories = [
                'Short', 'Saia', 'Blusa', 'Vestido', 'Macacão', 'Calça',
                'Camiseta', 'Casaco', 'Lingerie', 'Moda Praia', 'Tênis',
                'Sandália', 'Bota', 'Sapato', 'Acessórios'
            ];

            const newCategories: Category[] = [];

            for (const name of defaultCategories) {
                // Check if already exists to avoid duplicates
                const exists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());
                if (!exists) {
                    const { data, error } = await supabase
                        .from('fashion_categories')
                        .insert({ shop_id: shop.id, name })
                        .select()
                        .single();
                    
                    if (!error && data) {
                        newCategories.push(data);
                    }
                }
            }

            if (newCategories.length > 0) {
                setCategories([...categories, ...newCategories]);
                toast.success(`${newCategories.length} categorias padrão adicionadas!`);
            } else {
                toast.info('As categorias padrão já existem.');
            }

        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao gerar categorias: " + (error.message || translateSupabaseError(error)));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gerenciar Categorias</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="mb-4 flex justify-end">
                    <button
                        type="button"
                        onClick={handleGenerateDefaults}
                        disabled={submitting}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">auto_fix</span>
                        Gerar Categorias Padrão
                    </button>
                </div>

                <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nova categoria..."
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={submitting}
                    />
                    <button
                        type="submit"
                        disabled={submitting || !newCategoryName.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </form>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {loading ? (
                        <p className="text-center text-slate-500 text-sm py-4">
                            <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-purple-600 rounded-full animate-spin mr-2"></span>
                            Carregando...
                        </p>
                    ) : errorMsg ? (
                        <div className="text-center py-4">
                            <p className="text-red-500 text-sm mb-2">{errorMsg}</p>
                            <button onClick={() => { setLoading(true); fetchCategories(); }} className="text-purple-600 text-sm font-medium hover:underline">
                                Tentar novamente
                            </button>
                        </div>
                    ) : categories.length === 0 ? (
                        <p className="text-center text-slate-500 text-sm">Nenhuma categoria cadastrada.</p>
                    ) : (
                        categories.map((cat) => (
                            <div key={cat.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg group">
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.name}</span>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
