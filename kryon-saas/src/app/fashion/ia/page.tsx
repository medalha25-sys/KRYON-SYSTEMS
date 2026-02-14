'use client'

import { useState } from 'react'

export default function FashionAIPage() {
  const [activeTab, setActiveTab] = useState('stylist')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const features = [
    { id: 'stylist', label: 'Stylist Virtual', icon: 'checkroom', desc: 'Sugestões de combinações de roupas baseadas no estoque.' },
    { id: 'stock', label: 'Reposição Inteligente', icon: 'inventory', desc: 'Previsão de estoque e sugestão de compras.' },
    { id: 'trends', label: 'Tendências', icon: 'trending_up', desc: 'Análise de tendências de moda atuais.' },
    { id: 'pricing', label: 'Precificação', icon: 'attach_money', desc: 'Sugestão de preço ideal baseado em custos e mercado.' },
  ]

  const handleGenerate = (type: string) => {
      setIsLoading(true);
      setResult(null);
      
      // Simulate AI processing
      setTimeout(() => {
          setIsLoading(false);
          if (type === 'stylist') {
              setResult({
                  outfit: 'Look Casual Chic de Verão',
                  items: [
                      { name: 'Blusa de Linho Branca', price: 'R$ 120,00' },
                      { name: 'Shorts de Alfaiataria Bege', price: 'R$ 90,00' },
                      { name: 'Sandália Rasteira Dourada', price: 'R$ 150,00' }
                  ],
                  note: 'Ideal para o clima atual. Alta probabilidade de venda conjunta.'
              });
          } else if (type === 'stock') {
              setResult({
                  alert: 'Reposição Necessária',
                  items: [
                      { name: 'Vestido Floral (M)', current: 2, suggested: 10 },
                      { name: 'Calça Jeans Skinny (38)', current: 1, suggested: 15 }
                  ],
                  note: 'Baseado no histórico de vendas dos últimos 30 dias.'
              });
          }
      }, 2000);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inteligência Artificial Fashion</h1>
        <p className="text-slate-500">Ferramentas avançadas para impulsionar sua loja.</p>
      </div>

      {/* Feature Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-1">
        {features.map((f) => (
            <button
                key={f.id}
                onClick={() => { setActiveTab(f.id); setResult(null); }}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === f.id 
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-medium' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
                <span className="material-symbols-outlined text-lg">{f.icon}</span>
                {f.label}
            </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm min-h-[400px]">
        {activeTab === 'stylist' && (
            <div className="text-center py-8">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">checkroom</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Stylist Virtual</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Selecione uma peça do seu estoque e nossa IA irá sugerir combinações perfeitas para montar looks e aumentar o ticket médio.
                </p>
                
                {!result && !isLoading && (
                    <button 
                        onClick={() => handleGenerate('stylist')}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium flex items-center gap-2 mx-auto"
                    >
                        <span className="material-symbols-outlined">auto_awesome</span>
                        Gerar Combinação Exemplo
                    </button>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-purple-600 text-4xl mb-2">refresh</span>
                        <p className="text-slate-500">Analisando tendências e estoque...</p>
                    </div>
                )}

                {result && (
                    <div className="max-w-md mx-auto bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800 text-left animate-in fade-in slide-in-from-bottom-4">
                        <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined">star</span>
                            {result.outfit}
                        </h4>
                        <ul className="space-y-2 mb-4">
                            {result.items.map((item: any, i: number) => (
                                <li key={i} className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                                    <span>{item.name}</span>
                                    <span className="font-bold">{item.price}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-purple-600 dark:text-purple-400 italic border-t border-purple-200 dark:border-purple-800 pt-2">
                            Sugestão: {result.note}
                        </p>
                        <button onClick={() => setResult(null)} className="mt-4 text-sm text-slate-500 hover:text-purple-600 underline">
                            Tentar Outra
                        </button>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'stock' && (
            <div className="text-center py-8">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">inventory</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reposição Inteligente</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Nossa IA analisa seu histórico de vendas e sazonalidade para sugerir exatamente o que e quando comprar.
                </p>
                
                {!result && !isLoading && (
                    <button 
                        onClick={() => handleGenerate('stock')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center gap-2 mx-auto"
                    >
                        <span className="material-symbols-outlined">analytics</span>
                        Analisar Estoque
                    </button>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-blue-600 text-4xl mb-2">refresh</span>
                        <p className="text-slate-500">Processando dados de vendas...</p>
                    </div>
                )}

                {result && (
                    <div className="max-w-md mx-auto bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 text-left animate-in fade-in slide-in-from-bottom-4">
                        <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined">warning</span>
                            {result.alert}
                        </h4>
                        <table className="w-full text-sm text-left mb-4">
                            <thead className="text-slate-400 font-medium">
                                <tr>
                                    <th className="pb-2">Item</th>
                                    <th className="pb-2 text-right">Atual</th>
                                    <th className="pb-2 text-right">Sugerido</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-200 dark:divide-blue-800 text-slate-700 dark:text-slate-300">
                                {result.items.map((item: any, i: number) => (
                                    <tr key={i}>
                                        <td className="py-2">{item.name}</td>
                                        <td className="py-2 text-right text-red-500 font-bold">{item.current}</td>
                                        <td className="py-2 text-right text-green-600 font-bold">{item.suggested}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-xs text-blue-600 dark:text-blue-400 italic border-t border-blue-200 dark:border-blue-800 pt-2">
                            Insight: {result.note}
                        </p>
                        <button onClick={() => setResult(null)} className="mt-4 text-sm text-slate-500 hover:text-blue-600 underline">
                            Nova Análise
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* Placeholders for others */}
        {(activeTab === 'trends' || activeTab === 'pricing') && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-4 opacity-50">construction</span>
                <p>Em desenvolvimento. Em breve disponível.</p>
            </div>
        )}
      </div>
    </div>
  )
}
