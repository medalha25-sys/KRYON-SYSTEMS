import Link from 'next/link'

export default function AssinarPage({
  searchParams,
}: {
  searchParams: { product?: string; expired?: string }
}) {
  const product = searchParams.product || 'produto'
  const isExpired = searchParams.expired === 'true'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isExpired ? 'Período de Teste Expirado' : 'Assinatura Necessária'}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300">
          {isExpired 
            ? `O período de teste para o ${product} acabou. Para continuar usando, realize a assinatura.`
            : `Você precisa de uma assinatura ativa para acessar o ${product}.`
          }
        </p>

        <div className="pt-4 space-y-3">
          <button className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition">
             Assinar Agora
          </button>
          
          <Link href="/" className="block text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
             Voltar para Início
          </Link>
        </div>
      </div>
    </div>
  )
}
