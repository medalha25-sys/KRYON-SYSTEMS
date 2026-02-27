'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Product {
    id: string;
    name: string;
    quantity: number;
}

interface DamageModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

const DamageModal: React.FC<DamageModalProps> = ({ isOpen, onClose, product }) => {
    const [quantity, setQuantity] = useState('1');
    const [reason, setReason] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();

    if (!isOpen || !product) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseInt(quantity);

        if (qty <= 0 || qty > product.quantity) {
            alert(`A quantidade deve ser entre 1 e ${product.quantity}.`);
            return;
        }

        setIsSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { data: profile } = await supabase
              .from('profiles')
              .select('shop_id')
              .eq('id', user.id)
              .single();

            const shopId = profile?.shop_id;

            // 1. Record the damage
            const { error: damageError } = await supabase
                .from('damaged_products')
                .insert([{
                    product_id: product.id,
                    quantity: qty,
                    reason: reason,
                    recorded_by: user.id,
                    shop_id: shopId
                }]);

            if (damageError) throw damageError;

            // 2. Update stock quantity
            const { error: stockError } = await supabase
                .from('products')
                .update({ quantity: product.quantity - qty })
                .eq('id', product.id)
                .eq('shop_id', shopId);

            if (stockError) throw stockError;

            onClose();
            setQuantity('1');
            setReason('');
        } catch (error) {
            console.error('Error reporting damage:', error);
            alert('Erro ao registrar avaria. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1e2730] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-red-500/5 dark:bg-red-500/10">
                    <div className="flex items-center gap-3 text-red-500">
                        <span className="material-symbols-outlined font-black">report_problem</span>
                        <h2 className="text-xl font-black tracking-tight">Reportar Avaria</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Produto Selecionado</p>
                        <p className="font-black text-[#111418] dark:text-white text-xl tracking-tight">{product.name}</p>
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                          Estoque Atual: {product.quantity} unidades
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantidade Perdida</label>
                        <input
                            type="number"
                            min="1"
                            max={product.quantity}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            className="w-full h-12 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-900 px-4 text-[#111418] dark:text-white font-black text-xl focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Motivo / Descrição</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Tela trincada durante manuseio ou queda no estoque..."
                            rows={3}
                            className="w-full rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-900 p-4 text-[#111418] dark:text-white text-sm focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all resize-none shadow-inner"
                        />
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-[2] py-4 rounded-xl text-sm font-black text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                                    Confirmar Baixa
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DamageModal;
