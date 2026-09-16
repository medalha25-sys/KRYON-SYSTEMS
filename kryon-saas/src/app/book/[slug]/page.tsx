import { createClient } from '@/utils/supabase/server'
import BookingWizard from '@/components/booking/BookingWizard'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!org || org.public_booking_enabled === false) {
    return {
      title: 'Agendamento Online | Kryon Agenda',
      description: 'Agende seu horário online de forma rápida e segura.'
    }
  }

  const title = `${org.name} - Agendamento Online | Kryon Agenda`
  const description = org.welcome_message || `Agende seu horário online com ${org.name}. Rápido, fácil e sem complicações.`

  return {
    title,
    description,
    alternates: {
      canonical: `/book/${org.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/book/${org.slug}`,
      siteName: 'Kryon Agenda',
      images: org.logo_url ? [{ url: org.logo_url }] : [],
      locale: 'pt_BR',
      type: 'website',
    }
  }
}

export default async function BookingPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  
  if (!org || org.public_booking_enabled === false) {
    return notFound()
  }

  const { data: services } = await supabase
    .from('agenda_services')
    .select('id, name, price, duration_minutes')
    .eq('organization_id', org.id)
    .eq('active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
            {org.logo_url ? (
                <div className="mx-auto h-24 w-24 relative mb-4 shadow-md rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                    <Image 
                        src={org.logo_url} 
                        alt={org.name} 
                        fill 
                        className="object-cover"
                    />
                </div>
            ) : (
                <div 
                  className="mx-auto h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md mb-4"
                  style={{ backgroundColor: org.primary_color || '#3b82f6' }}
                >
                  {org.name ? org.name.charAt(0).toUpperCase() : 'A'}
                </div>
            )}
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {org.name}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {org.welcome_message || 'Agende seu horário online'}
            </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <BookingWizard organization={org} services={services || []} />
        </div>

        <div className="text-center text-xs text-gray-400 dark:text-gray-500">
          Desenvolvido por <span className="font-semibold text-gray-600 dark:text-gray-300">Kryon Agenda</span>
        </div>
      </div>
    </div>
  )
}


