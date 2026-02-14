import { createClient } from '@/utils/supabase/server'
import ShareLink from '@/components/agenda/ShareLink'

export default async function GestaoPetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Gestão Pet 🐶🐱</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Tutores</h2>
            <p className="text-gray-500 mb-4">Gerencie seus clientes e tutores.</p>
            <a href="/products/gestao-pet/tutores" className="text-primary hover:underline">Acessar &rarr;</a>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Pets</h2>
            <p className="text-gray-500 mb-4">Gerencie os animais cadastrados.</p>
            <a href="/products/gestao-pet/pets" className="text-primary hover:underline">Acessar &rarr;</a>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Agendamentos</h2>
            <p className="text-gray-500 mb-4">Agenda de banho, tosa e consultas.</p>
            <a href="/products/gestao-pet/agendamentos" className="text-primary hover:underline">Acessar &rarr;</a>
        </div>
      </div>
    </div>
  )
}
