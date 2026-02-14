'use client'

import React, { useState } from 'react'
import { Professional, Appointment, Service, Client } from '@/types/agenda' // Corrected import path
import { format, addMinutes, isSameDay, parseISO, getHours, setHours, setMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AgendaGridProps {
  date: Date
  professionals: Professional[]
  appointments: Appointment[]
  services: Service[]
  clients: Client[]
  onSlotClick?: (date: Date, time: string, professionalId: string) => void
}

export default function AgendaGrid({ date, professionals, appointments, services, clients, onSlotClick }: AgendaGridProps) {
  const [selectedProfessional, setSelectedProfessional] = useState<string | 'all'>('all')

  // Generate Time Slots (08:00 to 18:00)
  const START_HOUR = 8
  const END_HOUR = 18
  const slots = []
  for (let i = START_HOUR; i < END_HOUR; i++) {
    slots.push(setHours(setMinutes(new Date(date), 0), i))
    slots.push(setHours(setMinutes(new Date(date), 30), i))
  }

  const filteredProfessionals = selectedProfessional === 'all' 
    ? professionals 
    : professionals.filter(p => p.id === selectedProfessional)

  const getAppointmentsForSlot = (profId: string, slotTime: Date) => {
    return appointments.filter(app => {
      const appStart = parseISO(app.start_time)
      return app.professional_id === profId && 
             getHours(appStart) === getHours(slotTime) &&
             appStart.getMinutes() === slotTime.getMinutes()
    })
  }

  // Empty State
  if (professionals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full">
            <span className="material-symbols-outlined text-4xl text-blue-500">person_add</span>
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nenhum profissional encontrado</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
                Para começar a agendar, você precisa cadastrar os profissionais que atendem em sua empresa.
            </p>
        </div>
        <a 
            href="/products/agenda-facil/profissionais" 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
        >
            <span className="material-symbols-outlined text-xl">add</span>
            Cadastrar Profissional
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden">
      
      {/* Scrollable Container (Both X and Y) */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        
        {/* Header Row (Sticky Top) */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 min-w-max sticky top-0 z-20 shadow-sm">
          {/* Time Header Corner (Sticky Left) */}
          <div className="w-20 flex-shrink-0 p-4 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky left-0 z-30">
            <span className="text-xs font-bold text-gray-500">Horário</span>
          </div>
          
          {/* Professionals Headers */}
          <div className="flex flex-1">
             {filteredProfessionals.map(prof => (
               <div key={prof.id} className="flex-1 min-w-[200px] p-4 text-center font-semibold border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-white dark:bg-gray-800">
                  <div className="text-gray-900 dark:text-white capitalize">{prof.name}</div>
                  {prof.specialty && <span className="block text-xs text-gray-500 font-normal">{prof.specialty}</span>}
               </div>
             ))}
          </div>
        </div>

        {/* Grid Body */}
        <div className="min-w-max">
           {slots.map((slot, i) => (
             <div key={i} className="flex border-b border-gray-100 dark:border-gray-700 last:border-b-0 min-h-[60px]">
               {/* Time Label (Sticky Left) */}
               <div className="w-20 flex-shrink-0 p-2 text-right text-xs text-gray-500 border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 sticky left-0 z-10 flex items-center justify-end">
                 {format(slot, 'HH:mm')}
               </div>

               {/* Professionals Columns - Slots */}
               <div className="flex-1 flex">
                 {filteredProfessionals.map(prof => {
                   const slotApps = getAppointmentsForSlot(prof.id, slot)
                   
                   return (
                     <div key={prof.id} className="flex-1 min-w-[200px] border-r border-gray-100 dark:border-gray-700 last:border-r-0 relative group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        {/* Render Appointments */}
                        {slotApps.map(app => (
                           <div 
                             key={app.id} 
                             className="absolute inset-x-1 top-1 bottom-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-100 text-xs p-2 rounded border-l-4 border-blue-500 overflow-hidden shadow-sm z-10 cursor-pointer hover:shadow-md transition-shadow"
                             onClick={(e) => {
                                 e.stopPropagation();
                                 onSlotClick?.(new Date(date), format(slot, 'HH:mm'), prof.id) // Temporary: open modal on edit too? Or edit modal
                             }}
                             title={`${app.clients?.name} - ${app.agenda_services?.name}`}
                           >
                              <p className="font-bold truncate">{app.clients?.name || 'Cliente'}</p>
                              <p className="truncate opacity-75">{app.agenda_services?.name}</p>
                           </div>
                        ))}

                        {/* Empty Slot Action */}
                        {slotApps.length === 0 && (
                           <button 
                             onClick={() => onSlotClick?.(new Date(date), format(slot, 'HH:mm'), prof.id)}
                             className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-primary text-2xl font-bold"
                             title="Novo agendamento"
                           >
                              +
                           </button>
                        )}
                     </div>
                   )
                 })}
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
