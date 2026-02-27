'use client'

import { useState } from 'react'
import { createTransaction } from '@/app/products/agenda-facil/actions/financial'
import { PlusCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TransactionModalProps {
    categories: { id: string, name: string }[]
    professionals: { id: string, name: string }[]
    onSuccess?: () => void
}

export function TransactionModal({ categories, professionals, onSuccess }: TransactionModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'income',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    professional_id: '',
    status: 'paid'
  })

  // Simple Toast replacement
  function showToast(message: string, type: 'success' | 'error' = 'success') {
      alert(message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await createTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || null, 
        professional_id: formData.professional_id || null
    })

    setLoading(false)

    if (res.error) {
      showToast(res.error, 'error')
    } else {
      showToast('Transação criada com sucesso.')
      setOpen(false)
      setFormData({
        description: '',
        amount: '',
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        category_id: '',
        professional_id: '',
        status: 'paid'
      })
      router.refresh()
      if (onSuccess) onSuccess()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Nova Transação
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nova Transação</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Registre uma nova receita ou despesa.</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X className="h-5 w-5" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="type" className="text-sm font-medium text-right text-gray-700 dark:text-gray-300">Tipo</label>
                    <select 
                        id="type"
                        name="type"
                        className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.type}
                        onChange={handleChange}
                    >
                        <option value="income">Receita</option>
                        <option value="expense">Despesa</option>
                    </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="description" className="text-sm font-medium text-right text-gray-700 dark:text-gray-300">Descrição</label>
                    <input 
                        id="description" 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        required 
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="amount" className="text-sm font-medium text-right text-gray-700 dark:text-gray-300">Valor (R$)</label>
                    <input 
                        id="amount" 
                        name="amount" 
                        type="number" 
                        step="0.01" 
                        value={formData.amount} 
                        onChange={handleChange} 
                        className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        required 
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="date" className="text-sm font-medium text-right text-gray-700 dark:text-gray-300">Data</label>
                    <input 
                        id="date" 
                        name="date" 
                        type="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        required 
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="category" className="text-sm font-medium text-right text-gray-700 dark:text-gray-300">Categoria</label>
                    <select 
                        id="category"
                        name="category_id"
                        className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.category_id}
                        onChange={handleChange}
                    >
                        <option value="">Selecione...</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="professional" className="text-sm font-medium text-right text-gray-700 dark:text-gray-300">Profissional</label>
                    <select 
                        id="professional_id"
                        name="professional_id"
                        className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.professional_id}
                        onChange={handleChange}
                    >
                        <option value="">Nenhum (Global)</option>
                        {professionals.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="status" className="text-sm font-medium text-right text-gray-700 dark:text-gray-300">Status</label>
                    <select 
                        id="status"
                        name="status"
                        className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="paid">Pago</option>
                        <option value="pending">Pendente</option>
                    </select>
                </div>

                <div className="flex justify-end pt-4 gap-3">
                    <button 
                        type="button" 
                        onClick={() => setOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar Transação'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
