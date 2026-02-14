'use client'

import { useState } from 'react'

interface Product {
  slug: string
  name: string
}

interface ProductSwitchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (slug: string) => void
  currentProduct: string
  products: Product[]
  userName: string
}

export function ProductSwitchModal({
  isOpen,
  onClose,
  onSelect,
  currentProduct,
  products,
  userName
}: ProductSwitchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')

  if (!isOpen) return null

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Trocar Sistema</h2>
          <p className="text-sm text-slate-500 mt-1">
            Selecione o novo sistema para <strong>{userName}</strong>
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
          <input
            type="text"
            placeholder="Buscar sistema..."
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredProducts.map((product) => (
            <button
              key={product.slug}
              onClick={() => onSelect(product.slug)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition group ${
                currentProduct === product.slug
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 cursor-default'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
              disabled={currentProduct === product.slug}
            >
              <div>
                <p className={`font-medium ${
                  currentProduct === product.slug ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                }`}>
                  {product.name}
                </p>
                <p className="text-xs text-slate-400 font-mono">{product.slug}</p>
              </div>
              {currentProduct === product.slug && (
                <span className="material-symbols-outlined text-blue-500">check_circle</span>
              )}
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              Nenhum sistema encontrado.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
