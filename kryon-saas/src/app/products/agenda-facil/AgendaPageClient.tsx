'use client'

import React, { useState } from 'react'
import AgendaContainer from '@/components/agenda/AgendaContainer'
import DashboardOverview from '@/components/agenda/DashboardOverview'
import ShareLink from '@/components/agenda/ShareLink'
import NewAppointmentModal from '@/components/agenda/NewAppointmentModal'
import BlockScheduleModal from '@/components/agenda/BlockScheduleModal'
import AgendaSidebar from '@/components/agenda/AgendaSidebar'
import ClientList from '@/components/agenda/ClientList'
import { useRouter } from 'next/navigation'
import { AdminDashboard } from '@/components/agenda/AdminDashboard'
import { ProfessionalDashboard } from '@/components/agenda/ProfessionalDashboard'
import { SettingsView } from '@/components/agenda/SettingsView'

interface AgendaPageProps {
  date: string
  agendaData: any
  dashboardData: any
  adminDashboardData?: any
  professionalDashboardData?: any
  organization?: any
  initialView?: 'dashboard' | 'agenda' | 'clients' | 'settings' | 'day' | 'week'
}

export default function AgendaPageClient({ date, agendaData, dashboardData, adminDashboardData, professionalDashboardData, organization, initialView }: AgendaPageProps) {
  const router = useRouter()
  
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
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [modalData, setModalData] = useState<{ date?: Date, time?: string, professionalId?: string, appointment?: any }>({})

  const handleOpenModal = (data: { date?: Date, time?: string, professionalId?: string, appointment?: any } = {}) => {
    setModalData(data)
    setIsModalOpen(true)
  }

  const handleViewChange = (viewId: string) => {
      if (viewId === 'finance') {
          router.push('/products/agenda-facil/financeiro')
          return
      }
      if (viewId === 'clients') {
          router.push('/products/agenda-facil/clientes')
          return
      }
      setMainView(viewId)
      router.push(`/products/agenda-facil?view=${viewId}`)
  }

  const userName = dashboardData?.userName || 'Dr. Silva' 

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Sidebar */}
      <AgendaSidebar 
        currentView={mainView} 
        onChangeView={handleViewChange}
        userName={userName}
        organizationName={organization?.name || 'Clínica Serena'}
        organizationLogo={organization?.logo_url}
        whiteLabelEnabled={organization?.white_label_enabled}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

            {mainView === 'dashboard' && (
                <div className="flex-1 overflow-auto">
                     {/* Share Link logic: Check if shopId exists and NO admin dashboard (since admins assume diff role view) */}
                     {agendaData.shopId && !adminDashboardData && <div className="mb-6 mx-8 mt-8"><ShareLink shopId={agendaData.shopId} /></div>}
                     
                     {adminDashboardData ? (
                        <AdminDashboard data={adminDashboardData} organizationName={organization?.name} />
                     ) : professionalDashboardData ? (
                        <ProfessionalDashboard data={professionalDashboardData} userName={userName} />
                     ) : dashboardData ? (
                        <div className="p-8">
                            <DashboardOverview 
                                data={dashboardData} 
                                onNewAppointment={() => handleOpenModal()} 
                            />
                        </div>
                     ) : (
                         <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                             <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-4">
                                <span className="material-symbols-outlined text-4xl">calendar_month</span>
                             </div>
                             <h2 className="text-xl font-semibold text-gray-900 mb-2">Bem-vindo ao Agenda Fácil</h2>
                             <p className="text-gray-500 max-w-md">
                                 Selecione uma opção no menu lateral para começar.
                             </p>
                             <button onClick={() => setMainView('agenda')} className="mt-6 text-blue-600 hover:text-blue-800 font-medium">
                                 Ir para Agenda
                             </button>
                         </div>
                     )}
                </div>
            )}

            {mainView === 'agenda' && (
                <div className="flex-1 h-full"> 
                   <AgendaContainer
                        date={date}
                        view={calendarView}
                        setView={setCalendarView}
                        professionals={agendaData.professionals || []}
                        services={agendaData.services || []}
                        clients={agendaData.clients || []}
                        appointments={agendaData.appointments || []}
                        onOpenModal={handleOpenModal}
                        onBlockClick={() => setIsBlockModalOpen(true)}
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
                <div className="flex-1 overflow-auto bg-gray-50 h-full">
                     {organization ? (
                        <SettingsView organization={organization} />
                     ) : (
                        <div className="p-8 text-center text-gray-500">
                             Você precisa estar vinculado a uma organização para acessar configurações.
                        </div>
                     )}
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
        appointment={modalData.appointment}
      />
      
      <BlockScheduleModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        professionals={agendaData.professionals || []}
      />
    </div>
  )
}
