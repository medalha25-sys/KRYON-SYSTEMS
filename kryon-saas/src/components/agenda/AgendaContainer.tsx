import Link from 'next/link'
import { useState } from 'react'
import AgendaGrid from '@/components/agenda/AgendaGrid'
import WeeklyAgenda from '@/components/agenda/WeeklyAgenda'
import { Appointment, Client, Professional, Service } from '@/types/agenda'
import { useRouter } from 'next/navigation'

interface AgendaContainerProps {
  date: string
  view: 'day' | 'week'
  setView: (view: 'day' | 'week') => void
  professionals: Professional[]
  appointments: Appointment[] 
  services: Service[]
  clients: Client[]
  onOpenModal: (data?: { date?: Date, time?: string, professionalId?: string, appointment?: Appointment }) => void
  onBlockClick?: () => void
}

export default function AgendaContainer({
  date,
  view,
  setView,
  professionals,
  appointments,
  services,
  clients,
  onOpenModal,
  onBlockClick
}: AgendaContainerProps) {
  const router = useRouter()

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // When changing date, we should keep the view
    router.push(`/products/agenda-facil?date=${e.target.value}&view=${view}`)
  }

  const handleViewChange = (newView: 'day' | 'week') => {
      setView(newView)
      router.push(`/products/agenda-facil?date=${date}&view=${newView}`)
  }

  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all')

  const filteredAppointments = selectedProfessionalId === 'all' 
    ? appointments 
    : appointments.filter(app => app.professional_id === selectedProfessionalId)

  const filteredProfessionals = selectedProfessionalId === 'all'
    ? professionals
    : professionals.filter(prof => prof.id === selectedProfessionalId)

  return (
    <div className="p-6 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda Semanal</h1>
          <p className="text-gray-500">Gerencie seus horários e atendimentos de forma acolhedora.</p>
        </div>
        <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex text-sm font-medium">
                <button 
                    onClick={() => handleViewChange('week')}
                    className={`px-3 py-1.5 rounded-md transition ${view === 'week' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Semana
                </button>
                <button 
                    onClick={() => handleViewChange('day')}
                    className={`px-3 py-1.5 rounded-md transition ${view === 'day' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Dia
                </button>
            </div>



            {/* Professional Filter */}
             <select 
                value={selectedProfessionalId}
                onChange={(e) => setSelectedProfessionalId(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                style={{ maxWidth: '200px' }}
            >
                <option value="all">Todos os Profissionais</option>
                {professionals.map(prof => (
                    <option key={prof.id} value={prof.id}>{prof.name}</option>
                ))}
            </select>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

            {/* Buttons */}
             <button 
                onClick={onBlockClick}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-gray-500">block</span>
                Bloquear horário
            </button>

            <button 
                onClick={() => onOpenModal({ date: new Date(date + 'T12:00:00') })}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-white">add_circle</span>
                Adicionar horário
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === 'week' ? (
            <WeeklyAgenda 
                date={new Date(date + 'T12:00:00')}
                professionals={filteredProfessionals}
                appointments={filteredAppointments}
                onSlotClick={(date, time, professionalId) => onOpenModal({ date, time, professionalId })}
                onAppointmentClick={(appt) => onOpenModal({ appointment: appt })}
            />
        ) : (
             <AgendaGrid 
                date={new Date(date + 'T12:00:00')} // Avoid timezone offset issues for display
                professionals={filteredProfessionals} 
                appointments={filteredAppointments}
                services={services}
                clients={clients}
                onSlotClick={(date, time, professionalId) => onOpenModal({ date, time, professionalId })}
                onAppointmentClick={(appt) => onOpenModal({ appointment: appt })}
            />
        )}
      </div>
    </div>
  )
}
