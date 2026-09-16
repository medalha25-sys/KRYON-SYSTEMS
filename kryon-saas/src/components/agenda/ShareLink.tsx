'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface ShareLinkProps {
  slug?: string
  shopId?: string
}

export default function ShareLink({ slug, shopId }: ShareLinkProps) {
  const [origin, setOrigin] = useState('')
  const [copied, setCopied] = useState(false)

  const identifier = slug || shopId

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  if (!identifier) return null

  const canonicalPath = `/book/${identifier}`
  const fullUrl = origin ? `${origin}${canonicalPath}` : canonicalPath

  const handleCopy = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        toast.success('Link copiado com sucesso.')
        setTimeout(() => setCopied(false), 2500)
      }
    } catch (err) {
      toast.error('Não foi possível copiar o link automaticamente.')
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3.5 w-full md:w-auto">
        <div className="p-2.5 bg-blue-600 dark:bg-blue-500 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-xl">share</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Link Público Canônico de Agendamento</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              Oficial
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Envie este link para seus clientes agendarem horários diretamente online.</p>
        </div>
      </div>
      
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto justify-end">
        <code className="text-xs font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg text-blue-700 dark:text-blue-400 truncate max-w-xs sm:max-w-sm select-all">
          {fullUrl}
        </code>
        
        <button 
          onClick={handleCopy}
          type="button"
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0 ${
            copied 
              ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? 'Copiado!' : 'Copiar link'}
        </button>

        <Link
          href={canonicalPath}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-1 shrink-0"
          title="Abrir página de agendamento em nova aba"
        >
          <span className="material-symbols-outlined text-base">open_in_new</span>
          <span className="hidden sm:inline">Abrir</span>
        </Link>
      </div>
    </div>
  )
}

