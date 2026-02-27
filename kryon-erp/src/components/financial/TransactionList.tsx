'use client'

import { useState } from 'react'
import { formatCurrency, formatDate } from '@/utils/format'
import { TransactionModal } from './TransactionModal'
import { deleteTransaction } from '@/app/products/agenda-facil/actions/financial'
import { Trash2, Edit } from 'lucide-react'

// Simple Toast replacement
function showToast(message: string, type: 'success' | 'error' = 'success') {
    alert(message) // Simple alert for now as no toast lib is standard
}

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  status: string
  category?: { name: string, color: string }
  professional?: { name: string }
}

interface TransactionListProps {
  initialTransactions: Transaction[]
  professionals: { id: string, name: string }[]
  categories: { id: string, name: string }[]
}

export function TransactionList({ initialTransactions, professionals, categories }: TransactionListProps) {
  const [data, setData] = useState(initialTransactions)
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const filteredData = data.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    return true
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    
    setLoading(true)
    const res = await deleteTransaction(id)
    setLoading(false)

    if (res.error) {
      showToast(res.error, 'error')
    } else {
      showToast('Transação excluída.')
      setData(prev => prev.filter(t => t.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
        <div className="flex gap-2">
          <select 
            className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Todos os Tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </div>
        
        <TransactionModal 
            categories={categories}
            professionals={professionals}
            onSuccess={() => {/* Page refresh handled separately or we could refetch */}}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border shadow-sm bg-white dark:bg-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Profissional</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Valor</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.length === 0 ? (
                <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        Nenhuma transação encontrada.
                    </td>
                </tr>
            ) : (
                filteredData.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3">{formatDate(transaction.date)}</td>
                    <td className="px-4 py-3 font-medium">{transaction.description}</td>
                    <td className="px-4 py-3">
                        {transaction.category ? (
                            <span className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: transaction.category.color || '#ccc' }}>
                                {transaction.category.name}
                            </span>
                        ) : '-'}
                    </td>
                    <td className="px-4 py-3">{transaction.professional?.name || '-'}</td>
                    <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                            {transaction.status === 'paid' ? 'Pago' : transaction.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.type === 'expense' ? '-' : ''}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                            <button 
                                className="p-1 text-gray-500 hover:text-blue-600 transition disabled:opacity-50"
                                onClick={() => {/* Edit to be implemented */}}
                                disabled={loading}
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <button 
                                className="p-1 text-gray-500 hover:text-red-600 transition disabled:opacity-50"
                                onClick={() => handleDelete(transaction.id)}
                                disabled={loading}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
