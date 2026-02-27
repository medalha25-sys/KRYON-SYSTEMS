'use client'

import React from 'react'

export default function ShareLink({ shopId, slug }: { shopId?: string, slug?: string }) {
  const [origin, setOrigin] = React.useState('')
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const handleCopy = () => {
    const link = `${window.location.origin}/agendar/${shopId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!shopId) return null

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-full text-blue-600 dark:text-blue-300">
            <span className="material-symbols-outlined">share</span>
        </div>
        <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Link de Agendamento</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Compartilhe este link com seus clientes.</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <code className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded flex-1 sm:flex-none text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
            {origin ? `${origin}/agendar/${shopId}` : `/agendar/${shopId}`}
        </code>
        <button 
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                copied 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
            <span className="material-symbols-outlined text-lg">
                {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
