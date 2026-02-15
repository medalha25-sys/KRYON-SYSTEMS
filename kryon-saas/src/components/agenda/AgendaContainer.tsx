import Link from 'next/link'
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
  onOpenModal: (data?: { date?: Date, time?: string, professionalId?: string }) => void
}

export default function AgendaContainer({
  date,
  view,
  setView,
  professionals,
  appointments,
  services,
  clients,
  onOpenModal
}: AgendaContainerProps) {
  const router = useRouter()

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // When changing date, we should keep the view
    router.push(`/products/agenda-facil?date=${e.target.value}&view=${view}`)
  }

  const handleViewChange = (newView: 'day' | 'week') => {
      setView(newView)
      // Also update URL to persist state on refresh
      router.push(`/products/agenda-facil?date=${date}&view=${newView}`)
  }

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

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

            {/* Buttons */}
             <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2">
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
                professionals={professionals}
                appointments={appointments}
                onSlotClick={(date, time, professionalId) => onOpenModal({ date, time, professionalId })}
            />
        ) : (
             <AgendaGrid 
                date={new Date(date + 'T12:00:00')} // Avoid timezone offset issues for display
                professionals={professionals} 
                appointments={appointments}
                services={services}
                clients={clients}
                onSlotClick={(date, time, professionalId) => onOpenModal({ date, time, professionalId })}
            />
        )}
      </div>
    </div>
  )
}
