export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Você está offline</h1>
      <p className="text-lg mb-8 text-center">
        Verifique sua conexão com a internet para continuar usando o sistema.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Tentar Novamente
      </button>
    </div>
  )
}
