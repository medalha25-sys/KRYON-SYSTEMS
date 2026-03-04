'use server'

import { createClient } from '@/utils/supabase/server'

export async function getLavaRapidoShopData(tenantId: string) {
  const supabase = await createClient()
  
  // Get Shop Info
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('id', tenantId)
    .single()

  // Get Services
  const { data: services } = await supabase
    .from('lava_rapido_services')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('active', true)

  return {
    shop,
    services: services || []
  }
}

export async function createLavaRapidoBooking(data: {
  tenant_id: string
  service_id: string
  customer_name: string
  customer_phone: string
  vehicle_plate: string
  vehicle_size: 'small' | 'medium' | 'large'
  booking_date: string
  start_time: string
}) {
  const supabase = await createClient()

  const { data: booking, error } = await supabase
    .from('lava_rapido_bookings')
    .insert([{
      tenant_id: data.tenant_id,
      service_id: data.service_id,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      vehicle_plate: data.vehicle_plate,
      vehicle_size: data.vehicle_size,
      booking_date: data.booking_date,
      start_time: data.start_time,
      status: 'pending'
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating booking:', error)
    return { error: 'Erro ao processar agendamento.' }
  }

  return { success: true, booking }
}

export async function getAvailableLavaRapidoTimes(tenantId: string, date: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lava_rapido_bookings')
    .select('start_time')
    .eq('tenant_id', tenantId)
    .eq('booking_date', date)
    .neq('status', 'canceled')

  if (error) {
    console.error('Error fetching booked times:', error)
    return []
  }

  // Return formatted times (HH:mm)
  return data.map(b => b.start_time.substring(0, 5))
}
