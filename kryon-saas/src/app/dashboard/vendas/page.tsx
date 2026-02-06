'use client';

import React, { useState } from 'react';
import { useCashRegister } from '@/components/CashRegisterContext';
import OpenRegisterModal from '@/components/OpenRegisterModal';
import SalesTerminal from '@/components/SalesTerminal';

const VendasPage: React.FC = () => {
    const { isRegisterOpen, openRegister } = useCashRegister();
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    if (isRegisterOpen) {
        return <SalesTerminal />;
    }

    return (
        <div className="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            <OpenRegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSuccess={(balance) => openRegister(balance)}
            />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-[#111418] dark:text-white text-3xl font-black leading-tight tracking-tight">Vendas & PDV</h1>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Inicie o expediente para realizar vendas e gerenciar o caixa.</p>
                </div>
                <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl hover:bg-primary-dark transition-all font-black text-lg shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined">point_of_sale</span>
                    Abrir Novo Caixa
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="w-full bg-white dark:bg-[#1e2730] rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 overflow-hidden transition-all hover:border-primary/30">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h2 className="text-[#111418] dark:text-white text-lg font-black tracking-tight uppercase text-xs text-gray-400">Atividade Recente</h2>
                        <span className="material-symbols-outlined text-gray-300">history</span>
                    </div>
                    <div className="p-16 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-full">
                          <span className="material-symbols-outlined text-6xl opacity-20">receipt_long</span>
                        </div>
                        <div className="max-w-xs">
                          <p className="font-bold text-gray-600 dark:text-gray-300">Nenhuma venda registrada hoje.</p>
                          <p className="text-sm">Abra o caixa para começar a processar pagamentos e gerar recibos.</p>
                        </div>
                    </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <span className="material-symbols-outlined text-9xl">analytics</span>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-6">Status do PDV</h3>
                  <div className="flex flex-col gap-1">
                    <span className="text-4xl font-black tracking-tighter">FECHADO</span>
                    <span className="text-xs font-medium opacity-70 italic">Último fechamento: Há 12 horas</span>
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full border border-white/20">
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                    Terminal Inativo
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1e2730] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 text-gray-500">
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Informações Fiscais</h4>
                  <div className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-800 pb-2">
                    <span className="font-medium">NFe-S</span>
                    <span className="font-bold text-gray-800 dark:text-white">Habilitado</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Contingência</span>
                    <span className="font-bold text-green-500">Inativo</span>
                  </div>
                </div>
              </div>
            </div>
        </div>
    );
};

export default VendasPage;
