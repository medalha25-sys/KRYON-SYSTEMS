'use client';

import React, { useState } from 'react';
import { useCashRegister } from './CashRegisterContext';
import { toast } from 'sonner';

interface OpenRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OpenRegisterModal({ isOpen, onClose }: OpenRegisterModalProps) {
    const { openRegister } = useCashRegister();
    const [openingBalance, setOpeningBalance] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const balance = parseFloat(openingBalance.replace(',', '.')) || 0;
            await openRegister(balance);
            toast.success('Caixa aberto com sucesso!');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao abrir caixa.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Abrir Caixa</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Suprimento Inicial / Fundo de Troco
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={openingBalance}
                                onChange={(e) => setOpeningBalance(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-bold text-slate-900 dark:text-white"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Informe o valor em dinheiro disponível na gaveta para troco.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-bold shadow-lg shadow-purple-500/20 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Abrindo...' : 'Abrir Caixa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
