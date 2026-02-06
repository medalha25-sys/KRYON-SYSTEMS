'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useCashRegister } from './CashRegisterContext';

interface CloseRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FinancialSummary {
    openingBalance: number;
    moneySales: number;
    creditSales: number;
    debitSales: number;
    pixSales: number;
    onAccountSales: number;
    totalSales: number;
    expectedCash: number;
}

const CloseRegisterModal: React.FC<CloseRegisterModalProps> = ({ isOpen, onClose }) => {
    const { sessionId, closeRegister } = useCashRegister();
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [finishing, setFinishing] = useState(false);
    const [countedCash, setCountedCash] = useState('');
    const supabase = createClient();

    useEffect(() => {
        if (isOpen && sessionId) {
            fetchSessionData();
        }
    }, [isOpen, sessionId]);

    const fetchSessionData = async () => {
        setLoading(true);
        try {
            const { data: sessionData, error: sessionError } = await supabase
                .from('register_sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (sessionError) throw sessionError;

            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select('*')
                .gte('created_at', sessionData.opened_at);

            if (salesError) throw salesError;

            let money = 0, credit = 0, debit = 0, pix = 0, onAccount = 0;
            let totalChange = 0;

            salesData?.forEach((sale: any) => {
                const methods = sale.payment_methods as any[];
                if (methods) {
                    methods.forEach(p => {
                        const amount = p.amount || 0;
                        switch (p.method) {
                            case 'money': money += amount; break;
                            case 'credit': credit += amount; break;
                            case 'debit': debit += amount; break;
                            case 'pix': pix += amount; break;
                            case 'on_account': onAccount += amount; break;
                        }
                    });
                }

                const saleTotal = sale.total || 0;
                const totalPaid = (methods || []).reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
                if (totalPaid > saleTotal) {
                    totalChange += (totalPaid - saleTotal);
                }
            });

            const adjustedMoney = Math.max(0, money - totalChange);
            const totalSales = adjustedMoney + credit + debit + pix + onAccount;
            const openingBalance = sessionData.opening_balance || 0;

            setSummary({
                openingBalance,
                moneySales: adjustedMoney,
                creditSales: credit,
                debitSales: debit,
                pixSales: pix,
                onAccountSales: onAccount,
                totalSales,
                expectedCash: openingBalance + adjustedMoney
            });

        } catch (error) {
            console.error(error);
            alert('Erro ao carregar dados do caixa. Por favor, tente novamente.');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleCloseRegister = async () => {
        setFinishing(true);
        try {
            const closingBalance = parseFloat(countedCash.replace(',', '.')) || summary?.expectedCash || 0;

            const { error } = await supabase
                .from('register_sessions')
                .update({
                    closed_at: new Date().toISOString(),
                    closing_balance: closingBalance,
                    status: 'closed',
                    notes: `Fechamento computado via sistema. Conferido: ${closingBalance}`
                })
                .eq('id', sessionId);

            if (error) throw error;

            await closeRegister(); 
            onClose();
        } catch (error) {
            alert('Erro ao fechar caixa');
            console.error(error);
            setFinishing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1e2730] rounded-2xl w-full max-w-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h2 className="text-2xl font-black dark:text-white tracking-tight">
                      Conferência de Caixa
                  </h2>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
                </div>

                {loading || !summary ? (
                    <div className="flex flex-col items-center justify-center p-12 gap-4">
                        <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Calculando totais...</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-2xl border border-primary/10 transition-colors">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Abertura</p>
                                <p className="text-2xl font-black text-primary">R$ {summary.openingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="bg-green-500/[0.03] dark:bg-green-500/10 p-5 rounded-2xl border border-green-500/10 transition-colors">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Vendas (Líquido)</p>
                                <p className="text-2xl font-black text-green-500">R$ {summary.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-400 font-black uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="px-5 py-4 text-left">Método de Pagamento</th>
                                        <th className="px-5 py-4 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-5 py-4 dark:text-gray-300 font-medium flex items-center gap-2">
                                          <span className="material-symbols-outlined text-gray-400 text-lg">payments</span> Dinheiro
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold dark:text-white">R$ {summary.moneySales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-5 py-4 dark:text-gray-300 font-medium flex items-center gap-2">
                                          <span className="material-symbols-outlined text-gray-400 text-lg">credit_card</span> Crédito
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold dark:text-white">R$ {summary.creditSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-5 py-4 dark:text-gray-300 font-medium flex items-center gap-2">
                                          <span className="material-symbols-outlined text-gray-400 text-lg">credit_card</span> Débito
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold dark:text-white">R$ {summary.debitSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-5 py-4 dark:text-gray-300 font-medium flex items-center gap-2">
                                          <span className="material-symbols-outlined text-gray-400 text-lg">qr_code_2</span> Pix
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold dark:text-white">R$ {summary.pixSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-5 py-4 dark:text-gray-300 font-medium flex items-center gap-2 text-orange-500">
                                          <span className="material-symbols-outlined text-orange-500 text-lg">badge</span> Fiado
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold text-orange-500">R$ {summary.onAccountSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Cash Conference */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                        Dinheiro em Caixa (Esperado)
                                    </label>
                                    <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                                        R$ {summary.expectedCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">info</span>
                                      Soma da abertura e vendas em espécie
                                    </p>
                                </div>
                                <div className="w-full md:w-48">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                        Conferência Real
                                    </label>
                                    <input
                                        type="number"
                                        value={countedCash}
                                        onChange={e => setCountedCash(e.target.value)}
                                        className="w-full p-3 border-2 border-transparent focus:border-primary rounded-xl bg-white dark:bg-gray-800 dark:text-white text-right font-black text-xl shadow-sm outline-none transition-all"
                                        placeholder={summary.expectedCash.toFixed(2)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCloseRegister}
                                disabled={finishing}
                                className="flex-[2] py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                {finishing ? (
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : 'Encerrar Expediente'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CloseRegisterModal;
