export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Configurações Globais</h1>
        <p className="text-slate-500">Ajustes do sistema SaaS.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 space-y-8">
         <div className="max-w-xl space-y-6">
            <div>
                <label className="flex items-center justify-between gap-4 cursor-pointer group">
                    <div>
                        <h3 className="font-medium text-slate-800 dark:text-white group-hover:text-blue-600 transition">Modo de Manutenção</h3>
                        <p className="text-sm text-slate-500">Impede o acesso de usuários comuns ao sistema.</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"/>
                    </div>
                </label>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                 <h3 className="font-medium text-slate-800 dark:text-white mb-4">E-mail do Administrador</h3>
                 <div className="flex gap-4">
                    <input 
                        type="email" 
                        disabled 
                        value="medalha25@gmail.com" 
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 cursor-not-allowed"
                    />
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-medium text-sm">
                        Alterar
                    </button>
                 </div>
                 <p className="text-xs text-slate-400 mt-2">Definido via variável de ambiente.</p>
            </div>
         </div>
      </div>
    </div>
  )
}
