'use client'

import React, { useState, useEffect } from 'react'
import { Transaction, Category, TransactionType, saveTransaction } from '@/app/products/agenda-facil/financeiro/actions'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Partial<Transaction>
  categories: Category[]
  type?: TransactionType
}

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  initialData, 
  categories, 
  type = 'income' 
}: TransactionModalProps) {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    description: '',
    amount: 0,
    type: type,
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'money',
    status: 'paid'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        ...initialData, 
        date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0] 
      })
    } else {
        setFormData(prev => ({ ...prev, type }))
    }
  }, [initialData, type, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await saveTransaction(formData)
      onClose()
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar transação')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const filteredCategories = categories.filter(c => c.type === formData.type)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {initialData?.id ? 'Editar Transação' : `Nova ${formData.type === 'income' ? 'Receita' : 'Despesa'}`}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'income'})}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${formData.type === 'income' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >Receita</button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'expense'})}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${formData.type === 'expense' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                >Despesa</button>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <input 
                    type="text" 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: Venda de Produto, Aluguel"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                    <input 
                        type="number" 
                        required
                        step="0.01"
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                        className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                    <input 
                        type="date" 
                        required
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                <select 
                    value={formData.category_id || ''}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                    className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="">Selecione...</option>
                    {filteredCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Pagamento</label>
                    <select 
                        value={formData.payment_method || 'money'}
                        onChange={e => setFormData({...formData, payment_method: e.target.value as any})}
                        className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="money">Dinheiro</option>
                        <option value="credit">Crédito</option>
                        <option value="debit">Débito</option>
                        <option value="pix">PIX</option>
                        <option value="transfer">Transferência</option>
                        <option value="other">Outro</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select 
                        value={formData.status || 'paid'}
                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                        className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="paid">Pago/Recebido</option>
                        <option value="pending">Pendente</option>
                    </select>
                </div>
             </div>

            <div className="pt-4 flex justify-end gap-2">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >Cancelar</button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                    {loading ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
      </div>
    </div>
  )
}
