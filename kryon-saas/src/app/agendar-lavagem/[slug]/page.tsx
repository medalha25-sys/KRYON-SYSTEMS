import { getLavaRapidoShopData } from './actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LavaRapidoPublicBooking from '@/components/lava-rapido/PublicBooking'

export const dynamic = 'force-dynamic'

export default async function LavaRapidoBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // No Lava Rápido, 'slug' é o ID do tenant (usuário) 
  // para obter os dados do lava-jato específico.
  const shopData = await getLavaRapidoShopData(slug)

  if (!shopData || !shopData.shop) {
    return notFound()
  }

  const { shop, services } = shopData

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-white">
      <div className="max-w-md w-full space-y-8 bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-800 relative overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[80px]" />
        
        <div className="text-center relative z-10">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <img 
                src="/branding/logo_character.png" 
                alt="Papa Léguas" 
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-blue-400">
                Papa Léguas
            </h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] -mt-1 mb-2">
                Lava Rápido
            </p>
            <p className="mt-4 text-sm text-gray-400">
                Agende sua lavagem premium em segundos
            </p>
        </div>

        <LavaRapidoPublicBooking
            tenant_id={slug} 
            shop={shop} 
            services={services} 
        />
        
        <div className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
            Powered by <Link href="/" className="text-blue-500 hover:text-blue-400">Kryon Systems</Link>
        </div>
      </div>
    </div>
  )
}
