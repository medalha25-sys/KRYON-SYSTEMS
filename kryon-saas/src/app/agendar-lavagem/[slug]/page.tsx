import { getLavaRapidoShopData } from './actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LavaRapidoPublicBooking from '@/components/lava-rapido/PublicBooking'

export const dynamic = 'force-dynamic'

export default async function LavaRapidoBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // No Lava Rápido, 'slug' é o ID do tenant (usuário) 
  // para obter os dados do lava-jato específico.
  let shopData = null;
  let errorDetail = "";

  try {
    shopData = await getLavaRapidoShopData(slug);
  } catch (e: any) {
    console.error("ERRO AO BUSCAR LOJA:", e);
    errorDetail = e?.message || "Erro desconhecido ao carregar dados";
  }

  if (!shopData || !shopData.shop) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-900/50 p-8 rounded-[2rem] max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Loja Não Encontrada</h1>
          <p className="text-gray-400 mb-6 font-mono text-sm break-all">ID: {slug}</p>
          {errorDetail && <p className="text-red-400/70 text-xs mb-6 italic">{errorDetail}</p>}
          <a href="/" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl transition-all">
            Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  const { shop, services } = shopData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="text-center">
            {shop.logo_url ? (
                <img src={shop.logo_url} alt={shop.name} className="mx-auto h-24 w-24 rounded-full object-cover mb-4 ring-4 ring-blue-500/20 shadow-xl" />
            ) : (
                 <div className="mx-auto h-24 w-24 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 text-3xl font-black mb-4 ring-4 ring-blue-500/5">
                    {shop.name ? shop.name[0] : 'P'}
                 </div>
            )}
            <h2 className="mt-2 text-3xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase">
                {shop.name}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                Agende sua lavagem online
            </p>
        </div>

        <LavaRapidoPublicBooking 
            tenant_id={shop.id} 
            shop={shop} 
            services={services || []} 
        />
        
        <div className="mt-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Powered by <a href="https://kryonsystems.com.br" className="text-blue-500 hover:text-blue-600 transition-colors">Kryon Systems</a>
            </p>
        </div>
      </div>
    </div>
  )
}
