'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, User, Car, Phone, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function AgendamentosPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const supabase = createClient()

  async function fetchBookings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('lava_rapido_bookings')
      .select(`
        *,
        service:lava_rapido_services(*)
      `)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } else {
      setBookings(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('lava_rapido_bookings')
      .update({ status: newStatus })
      .eq('id', id)

    if (newStatus === 'completed') {
      const { data: bookingData } = await supabase
        .from('lava_rapido_bookings')
        .select('*, service:lava_rapido_services(*)')
        .eq('id', id)
        .single()

      if (bookingData) {
        const service = bookingData.service
        const amount = bookingData.vehicle_size === 'small' 
          ? service.price_small 
          : bookingData.vehicle_size === 'medium' 
            ? service.price_medium 
            : service.price_large

        await supabase.from('financial_transactions').insert([{
          organization_id: bookingData.tenant_id,
          description: `Lavagem: ${service.name} - Placa: ${bookingData.vehicle_plate || 'N/A'}`,
          amount: amount,
          type: 'income',
          date: new Date().toISOString().split('T')[0],
          status: 'paid'
        }])
      }
    }

    if (error) {
      alert('Erro ao atualizar status.')
      console.error(error)
    } else {
      fetchBookings()
    }
  }

  const filteredBookings = bookings.filter(b => b.status === filter)

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-1 text-white">Agendamentos Online</h1>
        <p className="text-gray-400">Gerencie as solicitações vindas pelo link de agendamento público.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-800">
        <button 
          onClick={() => setFilter('pending')}
          className={`pb-4 px-2 text-sm font-medium transition-all relative ${filter === 'pending' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Pendentes
          {bookings.filter(b => b.status === 'pending').length > 0 && (
            <span className="ml-2 bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full text-[10px]">
              {bookings.filter(b => b.status === 'pending').length}
            </span>
          )}
          {filter === 'pending' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={`pb-4 px-2 text-sm font-medium transition-all relative ${filter === 'completed' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Concluídos
          {filter === 'completed' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
        </button>
        <button 
          onClick={() => setFilter('canceled')}
          className={`pb-4 px-2 text-sm font-medium transition-all relative ${filter === 'canceled' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Cancelados
          {filter === 'canceled' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
            Carregando agenda...
          </div>
        ) : filteredBookings.length > 0 ? (
          <AnimatePresence>
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <BookingCard 
                  booking={booking}
                  onUpdate={updateStatus}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="bg-gray-900/30 border border-dashed border-gray-800 rounded-2xl py-20 text-center text-gray-500">
            Nenhum agendamento encontrado nesta categoria.
          </div>
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking, onUpdate }: { booking: any, onUpdate: (id: string, state: string) => void }) {
  const sizeLabel = booking.vehicle_size === 'small' ? 'Pequeno' : booking.vehicle_size === 'medium' ? 'Médio' : 'Grande'
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gray-700 transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
           <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">{booking.customer_name}</h3>
          <div className="text-sm text-gray-400 mb-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> {booking.customer_phone}
            </div>
            <a 
              href={`https://wa.me/55${booking.customer_phone.replace(/\D/g, '')}?text=Olá ${booking.customer_name}, falo do Lava Rápido! Sobre o agendamento hoje às ${booking.start_time.substring(0, 5)}...`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-400 font-bold text-[10px] bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 transition-all flex items-center gap-1 active:scale-95"
            >
              💬 WhatsApp
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            {booking.vehicle_plate && (
              <span className="text-[10px] bg-gray-800 px-2 py-1 rounded border border-gray-700 font-mono text-white">{booking.vehicle_plate}</span>
            )}
            <span className="text-[10px] bg-gray-950 px-2 py-1 rounded border border-gray-800 text-gray-400 font-bold uppercase">{sizeLabel}</span>
            <span className="text-[10px] bg-blue-900/20 text-blue-400 px-2 py-1 rounded border border-blue-900/30 font-bold uppercase">
              {booking.service?.name || 'Serviço'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 border-t md:border-t-0 border-gray-800 pt-4 md:pt-0">
        <div className="flex flex-col items-end">
           <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
             <CalendarIcon className="w-4 h-4 text-gray-500" />
             {new Date(booking.booking_date).toLocaleDateString('pt-BR')}
           </div>
           <div className="flex items-center gap-2 text-sm text-gray-300">
             <Clock className="w-4 h-4 text-gray-500" />
             {booking.start_time.substring(0, 5)}
           </div>
        </div>

        {booking.status === 'pending' && (
          <div className="flex gap-2">
            <button 
              onClick={() => onUpdate(booking.id, 'completed')}
              className="p-2.5 bg-green-600/10 text-green-500 border border-green-600/20 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-lg hover:shadow-green-900/20"
              title="Concluir"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onUpdate(booking.id, 'canceled')}
              className="p-2.5 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg hover:shadow-red-900/20"
              title="Cancelar"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
