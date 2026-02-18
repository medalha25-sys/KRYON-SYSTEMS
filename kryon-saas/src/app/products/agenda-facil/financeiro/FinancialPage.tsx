'use client'

import React, { useState } from 'react'
import { Transaction, Category } from './actions'
import TransactionModal from '@/components/finance/TransactionModal'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import AgendaSidebar from '@/components/agenda/AgendaSidebar'

export default function FinancialPage({
    summary,
    transactions: initialTransactions,
    categories
}: {
    summary: { income: number, expense: number, balance: number },
    transactions: Transaction[],
    categories: Category[]
}) {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<Partial<Transaction> | undefined>(undefined)
    const [modalType, setModalType] = useState<'income' | 'expense'>('income')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    
    // Use initialTransactions directly or via state if we plan to update client-side (search/filter)?
    // The original code used state 'transactions' initialized from props.
    const [transactions, setTransactions] = useState(initialTransactions)

    const handleViewChange = (viewId: string) => {
        if (viewId === 'dashboard') router.push('/products/agenda-facil')
        if (viewId === 'agenda') router.push('/products/agenda-facil?view=agenda')
        if (viewId === 'clients') router.push('/products/agenda-facil?view=clients')
        if (viewId === 'settings') router.push('/products/agenda-facil?view=settings')
        // finance = stay here
    }

    const userName = 'Dr. Silva' // Fallback

    const handleOpenModal = (type: 'income' | 'expense', transaction?: Transaction) => {
        setModalType(type)
        setSelectedTransaction(transaction)
        setIsModalOpen(true)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    const handleFilter = () => {
        window.location.href = `?start=${startDate}&end=${endDate}`
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <AgendaSidebar 
                currentView="finance" 
                onChangeView={handleViewChange}
                userName={userName}
            />
            <div className="flex-1 overflow-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleOpenModal('expense')}
                            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">remove</span>
                            Despesa
                        </button>
                        <button 
                            onClick={() => handleOpenModal('income')}
                            className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Receita
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full">
                                <span className="material-symbols-outlined">arrow_upward</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Receitas</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.income)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full">
                                <span className="material-symbols-outlined">arrow_downward</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Despesas</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.expense)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${summary.balance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Saldo</p>
                                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {formatCurrency(summary.balance)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex gap-4 items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por data:</span>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded-lg p-2 text-sm dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-gray-400">até</span>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded-lg p-2 text-sm dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button 
                      onClick={handleFilter}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                        Filtrar
                    </button>
                </div>

                {/* Transactions List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Data</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Descrição</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {transactions.map((t: Transaction) => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                        {format(new Date(t.date), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium text-gray-900 dark:text-white">{t.description}</p>
                                        <p className="text-xs text-gray-500">{t.payment_method}</p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                        {(t as any).financial_categories?.name || '-'}
                                    </td>
                                    <td className={`p-4 font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'expense' ? '-' : '+'} {formatCurrency(t.amount)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            t.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                            t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {t.status === 'paid' ? 'Pago' : t.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleOpenModal(t.type, t)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Nenhuma transação encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <TransactionModal 
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setSelectedTransaction(undefined)
                    }}
                    initialData={selectedTransaction}
                    categories={categories}
                    type={modalType}
                />
            </div>
        </div>
    )
}
