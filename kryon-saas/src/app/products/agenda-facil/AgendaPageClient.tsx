'use client'

import React, { useState } from 'react'
import AgendaContainer from '@/components/agenda/AgendaContainer'
import DashboardOverview from '@/components/agenda/DashboardOverview'
import ShareLink from '@/components/agenda/ShareLink'
import NewAppointmentModal from '@/components/agenda/NewAppointmentModal'
import AgendaSidebar from '@/components/agenda/AgendaSidebar'
import ClientList from '@/components/agenda/ClientList'
import { useRouter } from 'next/navigation'

interface AgendaPageProps {
  date: string
  agendaData: any
  dashboardData: any
  initialView?: 'dashboard' | 'agenda' | 'clients' | 'settings' | 'day' | 'week'
}

export default function AgendaPageClient({ date, agendaData, dashboardData, initialView }: AgendaPageProps) {
  const router = useRouter()
  
  // Normalize initialView
  // If 'day' or 'week' is passed (legacy), map to 'agenda' but keep internal calendar view state?
  // AgendaContainer manages 'day'/'week' internally via props.
  // We need mainView state ('dashboard', 'agenda', 'clients', 'finance', 'settings')
  
  // Logic: 
  // If initialView is 'day' or 'week', mainView = 'agenda'. 
  // If initialView is 'dashboard' or undefined, mainView = 'dashboard'.
  
  const resolveMainView = (v?: string): string => {
      if (v === 'day' || v === 'week' || v === 'agenda') return 'agenda'
      if (v === 'clients') return 'clients'
      if (v === 'settings') return 'settings'
      if (v === 'finance') return 'finance'
      return 'dashboard'
  }

  const [mainView, setMainView] = useState<string>(resolveMainView(initialView))
  const [calendarView, setCalendarView] = useState<'day' | 'week'>((initialView === 'week') ? 'week' : 'day')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState<{ date?: Date, time?: string, professionalId?: string }>({})

  const handleOpenModal = (data: { date?: Date, time?: string, professionalId?: string } = {}) => {
    setModalData(data)
    setIsModalOpen(true)
  }

  const handleViewChange = (viewId: string) => {
      if (viewId === 'finance') {
          // Redirect to existing finance page which is separate route for now
          // Or render if I can. But finance is a separate page structure perhaps?
          // Previous link was /products/agenda-facil/financeiro
          router.push('/products/agenda-facil/financeiro')
          return
      }
      setMainView(viewId)
      // Optional: Update URL? 
      // router.push(`/products/agenda-facil?view=${viewId}`)
  }

  // Determine user name from data
  // dashboardData has userName. agendaData doesn't explicitly have it unless we fetched profile.
  // We can pass userName from server or extract from dashboardData (which might be null if view != dashboard?)
  // Actually getDashboardData fetches profile. getAgendaData fetches profile too for shopId.
  // Let's rely on dashboardData?.userName or fallback.
  const userName = dashboardData?.userName || 'Dr. Silva' 

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Sidebar */}
      <AgendaSidebar 
        currentView={mainView} 
        onChangeView={handleViewChange}
        userName={userName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* We don't need the top header 'Agenda Facil' anymore, Sidebar has it? 
                Sidebar has Profile. 
                We might want a top bar for title?
                Design (Step 384/390) shows distinct headers per view.
                e.g. "Olá, Dr. Silva" (Dashboard), "Agenda Semanal" (Calendário).
            */}

            {mainView === 'dashboard' && (
                <div className="flex-1 overflow-auto p-8">
                     {agendaData.shopId && <div className="mb-6"><ShareLink shopId={agendaData.shopId} /></div>}
                     
                     {dashboardData ? (
                        <DashboardOverview 
                            data={dashboardData} 
                            onNewAppointment={() => handleOpenModal()} 
                        />
                     ) : (
                         <div className="text-center p-12 text-gray-500">
                             Carregando painel...
                         </div>
                     )}
                </div>
            )}

            {mainView === 'agenda' && (
                <div className="flex-1 h-full"> 
                   {/* AgendaContainer has its own internal layout/padding */}
                   <AgendaContainer
                        date={date}
                        view={calendarView}
                        setView={setCalendarView}
                        professionals={agendaData.professionals || []}
                        services={agendaData.services || []}
                        clients={agendaData.clients || []}
                        appointments={agendaData.appointments || []}
                        onOpenModal={handleOpenModal}
                    />
                </div>
            )}

            {mainView === 'clients' && (
                <div className="flex-1 overflow-auto p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pacientes</h1>
                    <ClientList clients={agendaData.clients || []} />
                </div>
            )}
            
            {mainView === 'settings' && (
                <div className="flex-1 overflow-auto p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Configurações</h1>
                    <p className="text-gray-500">Funcionalidade em desenvolvimento.</p>
                </div>
            )}
      </div>

      <NewAppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clients={agendaData.clients || []}
        services={agendaData.services || []}
        professionals={agendaData.professionals || []}
        initialDate={modalData.date || new Date()}
        initialTime={modalData.time}
        initialProfessionalId={modalData.professionalId}
      />
    </div>
  )
}
