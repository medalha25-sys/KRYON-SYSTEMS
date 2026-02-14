import { getPublicShopData } from './actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PublicBooking from '@/components/agenda/PublicBooking'

export const dynamic = 'force-dynamic'

export default async function PublicSchedulingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const shopData = await getPublicShopData(slug)

  if (!shopData) {
    return notFound()
  }

  const { shop, professionals, services, tenant_id } = shopData

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
            {shop.logo_url ? (
                <img src={shop.logo_url} alt={shop.name} className="mx-auto h-24 w-24 rounded-full object-cover mb-4 ring-4 ring-primary/20" />
            ) : (
                 <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4 ring-4 ring-blue-50">
                    {shop.name ? shop.name[0] : 'A'}
                 </div>
            )}
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                {shop.name || 'Agendamento'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Agende seu horário online
            </p>
        </div>

        <PublicBooking 
            tenant_id={tenant_id} 
            shop={shop} 
            professionals={professionals} 
            services={services} 
        />
        
        <div className="mt-8 text-center text-xs text-gray-400">
            Powered by <Link href="/" className="font-bold hover:text-primary">Kryon Systems</Link>
        </div>
      </div>
    </div>
  )
}
