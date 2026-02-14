'use client'

import React from 'react'
import { Professional, Appointment, Service, Client } from '@/types/agenda'
import { format, addDays, startOfWeek, isSameDay, parseISO, getHours, setHours, setMinutes, isSameMinute, startOfHour } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface WeeklyAgendaProps {
  date: Date
  professionals: Professional[]
  appointments: Appointment[]
  onSlotClick?: (date: Date, time: string, professionalId: string) => void
}

export default function WeeklyAgenda({ date, professionals, appointments, onSlotClick }: WeeklyAgendaProps) {
  // We assume date is somewhere in the week. We find the start of the week (Monday).
  // Note: date-fns startOfWeek defaults to Sunday. We want Monday.
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // 1 = Monday
  
  const weekDays: Date[] = []
  for (let i = 0; i < 6; i++) { // Mon-Sat
    weekDays.push(addDays(weekStart, i))
  }

  // Time Slots (08:00 - 18:00)
  const START_HOUR = 8
  const END_HOUR = 18
  const hours = []
  for (let i = START_HOUR; i < END_HOUR; i++) {
    hours.push(i)
  }

  // Get Primary Professional (Mockup implies single user view? Or filter?)
  // For now, let's use the first professional or assume filtered upstream.
  // If multiple, maybe just show all mixed? Or filtered by 'selectedProfessional' state if we add it.
  // The props pass 'professionals'. Let's show for ALL professionals or assume user filtered.
  // In Dashboard logic, we are "Dr. Silva".
  
  const getAppointmentsForSlot = (day: Date, hour: number) => {
      return appointments.filter(app => {
          const appStart = parseISO(app.start_time)
          return isSameDay(appStart, day) && getHours(appStart) === hour
      })
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header Row */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
            <div className="w-16 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"></div>
            {weekDays.map(day => (
                <div key={day.toString()} className="flex-1 p-2 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                    <div className="text-xs font-bold text-gray-500 uppercase">{format(day, 'EEE', { locale: ptBR })}</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{format(day, 'd')}</div>
                </div>
            ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto custom-scrollbar">
            {hours.map(hour => (
                <div key={hour} className="flex border-b border-gray-100 dark:border-gray-700 min-h-[100px]">
                    {/* Time Label */}
                    <div className="w-16 p-2 text-xs text-gray-500 text-right border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        {hour}:00
                    </div>

                    {/* Days Columns */}
                    {weekDays.map(day => {
                        const slotApps = getAppointmentsForSlot(day, hour)
                        // Mockup shows "Horário Livre" as empty.
                        // We can add a "plus" button on hover.

                        return (
                            <div key={day.toString()} className="flex-1 border-r border-gray-100 dark:border-gray-700 last:border-r-0 relative group p-1">
                                {slotApps.map(app => (
                                    <div 
                                        key={app.id} 
                                        className={`mb-1 p-2 text-xs rounded border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow
                                            ${app.status === 'completed' ? 'bg-green-50 border-green-500 text-green-700' : 
                                              app.agenda_services?.name.toLowerCase().includes('online') ? 'bg-blue-50 border-blue-500 text-blue-700' :
                                              'bg-green-50 border-green-500 text-green-700' // Default to presencial style
                                            }
                                        `}
                                        onClick={() => onSlotClick?.(day, `${hour}:00`, app.professional_id)}
                                    >
                                        <div className="font-bold">{format(parseISO(app.start_time), 'HH:mm')} • {app.agenda_services?.name.includes('Online') ? 'Online' : 'Presencial'}</div>
                                        <div className="font-bold mt-1 text-sm">{app.clients?.name}</div>
                                    </div>
                                ))}

                                {slotApps.length === 0 && (
                                     <button 
                                        onClick={() => onSlotClick?.(day, `${hour}:00`, professionals[0]?.id)}
                                        className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                     >
                                        <span className="material-symbols-outlined text-gray-400">add</span>
                                     </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    </div>
  )
}
