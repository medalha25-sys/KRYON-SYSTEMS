'use client'

import { formatCurrency } from '@/utils/format'

interface FinancialSummaryProps {
  data: {
    income: number
    expense: number
    balance: number
    error?: string
  }
}

export function FinancialSummary({ data }: FinancialSummaryProps) {
  if (data.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600 font-medium text-center">{data.error}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Income */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Receitas</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-emerald-500"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{formatCurrency(data.income)}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total de entradas
          </p>
        </div>
      </div>

      {/* Expenses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Despesas</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-red-500"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(data.expense)}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total de saídas
          </p>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-gray-500"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div className="mt-2">
          <div className={`text-2xl font-bold ${data.balance >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-red-600 dark:text-red-500'}`}>
            {formatCurrency(data.balance)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
             Resultado líquido
          </p>
        </div>
      </div>
    </div>
  )
}
