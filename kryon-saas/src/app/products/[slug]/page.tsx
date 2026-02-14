import { createClient } from '@/utils/supabase/server'
import ERPDashboard from '@/components/ERPDashboard'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch some dummy data or real summary based on slug
  // For now, just generic welcome
  
  return (
    <div className="space-y-6">
      {/* Content based on Product Slug */}
      <div className="mt-0">
         {['mechanic', 'reseller', 'tech-assist', 'fashion-manager'].includes(slug) ? (
            <ERPDashboard />
         ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
               <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Área do {slug}</h2>
               <p className="text-gray-500 mt-2">Módulo em desenvolvimento ou não configurado para esta rota.</p>
            </div>
         )}
      </div>
    </div>
  )
}
