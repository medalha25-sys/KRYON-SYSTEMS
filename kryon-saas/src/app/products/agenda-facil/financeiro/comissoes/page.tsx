'use client'

import { useState, useEffect } from 'react'
import { getCommissionReport } from '../../actions/financial'
import { format } from 'date-fns'
import Link from 'next/link'

export default function CommissionPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchData()
  }, []) // Initial load

  async function fetchData() {
    setLoading(true)
    setError('')
    const res = await getCommissionReport({ startDate, endDate })
    if (Array.isArray(res)) {
        setData(res)
    } else if (res.error) {
        setError(res.error)
    }
    setLoading(false)
  }

  const totalGenerated = data.reduce((acc, curr) => acc + curr.total_generated, 0)
  const totalCommission = data.reduce((acc, curr) => acc + curr.total_commission, 0)
  const totalProfit = data.reduce((acc, curr) => acc + curr.total_profit, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatório de Comissões</h1>
            <p className="text-gray-500 dark:text-gray-400">Acompanhe o desempenho e repasses dos profissionais.</p>
        </div>
        <Link href="/products/agenda-facil/financeiro" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Voltar para Financeiro
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-end">
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Data Início</label>
            <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
        </div>
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Data Fim</label>
            <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
        </div>
        <button 
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
            <span className="material-symbols-outlined text-sm">filter_alt</span>
            Filtrar
        </button>
      </div>

      {/* Totals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Faturamento Total</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                R$ {totalGenerated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-blue-500 mt-1">Neste período</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Comissões a Pagar</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                R$ {totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-amber-500 mt-1">Custo profissional</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Lucro Líquido</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-green-500 mt-1">Retido pela clínica</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
            {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Profissional</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Produção Total</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Comissão</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Lucro Clínica</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Atendimentos</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {loading ? (
                       <tr>
                           <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Carregando dados...</td>
                       </tr> 
                    ) : data.length === 0 ? (
                        <tr>
                           <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum registro encontrado neste período.</td>
                       </tr>
                    ) : (
                        data.map((prof) => (
                            <tr key={prof.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{prof.name}</td>
                                <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">
                                    R$ {prof.total_generated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-amber-600 dark:text-amber-400">
                                    R$ {prof.total_commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-green-600 dark:text-green-400">
                                    R$ {prof.total_profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4 text-center text-gray-500">
                                    {prof.transactions.length}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}
