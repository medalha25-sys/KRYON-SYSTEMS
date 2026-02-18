import { createClient } from '@/utils/supabase/server'
import BookingWizard from '@/components/booking/BookingWizard'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export default async function BookingPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, logo_url, slug, public_booking_enabled, primary_color, secondary_color, welcome_message')
    .eq('slug', params.slug)
    .single()
  
  if (!org || !org.public_booking_enabled) {
    return notFound()
  }

  const { data: services } = await supabase
    .from('agenda_services')
    .select('id, name, price, duration_minutes')
    .eq('organization_id', org.id)
    .eq('active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            {org.logo_url && (
                <div className="mx-auto h-24 w-24 relative mb-4">
                    <Image 
                        src={org.logo_url} 
                        alt={org.name} 
                        fill 
                        className="object-contain rounded-full"
                    />
                </div>
            )}
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                {org.name}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
                {org.welcome_message || 'Agende seu horário online'}
            </p>
        </div>

        <BookingWizard organization={org} services={services || []} />
      </div>
    </div>
  )
}

