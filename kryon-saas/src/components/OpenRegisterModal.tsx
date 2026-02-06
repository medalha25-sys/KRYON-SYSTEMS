'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface OpenRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (openingBalance: number) => void;
}

const OpenRegisterModal: React.FC<OpenRegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [openingBalance, setOpeningBalance] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const supabase = createClient();

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Confirming identity/permissions before opening register
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                const balance = parseFloat(openingBalance.replace(',', '.')) || 0;
                onSuccess(balance);
                onClose();
            }
        } catch (err: any) {
            setError('Credenciais inválidas. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1e2730] w-full max-w-md rounded-xl shadow-2xl p-8">
                <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <span className="material-symbols-outlined text-primary text-3xl">point_of_sale</span>
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-[#111418] dark:text-white">Abrir Caixa</h2>
                        <p className="text-sm text-gray-500">Confirme seus dados para iniciar o expediente</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">E-mail de Operador</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm focus:border-primary focus:outline-none dark:text-white"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm focus:border-primary focus:outline-none dark:text-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Troco Inicial (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={openingBalance}
                            onChange={(e) => setOpeningBalance(e.target.value)}
                            className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm focus:border-primary focus:outline-none dark:text-white"
                            placeholder="0,00"
                        />
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">lock_open</span>
                                    Abrir Caixa
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OpenRegisterModal;
