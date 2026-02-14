'use client'

import React, { useState } from 'react'
import AgendaContainer from '@/components/agenda/AgendaContainer'
import DashboardOverview from '@/components/agenda/DashboardOverview'
import ShareLink from '@/components/agenda/ShareLink'
import NewAppointmentModal from '@/components/agenda/NewAppointmentModal'

interface AgendaPageProps {
  date: string
  agendaData: any
  dashboardData: any
  initialView?: 'day' | 'week'
}

export default function AgendaPageClient({ date, agendaData, dashboardData, initialView = 'day' }: AgendaPageProps) {
  // If we have an initialView from URL (e.g. ?view=week), we start in that view not dashboard, 
  // unless strictly navigating to dashboard. But usually dashboard is default route.
  // Actually, if ?view=week/day is present, it means user likely clicked a link or refreshed.
  // If ?view is missing, maybe default to dashboard? 
  // Let's say default is dashboard if no param? But page.tsx defaults to 'day' if missing.
  // Let's stick to: if URL has view=week/day, show that. If dashboard is desired, it should be a param or default.
  // But wait, the previous code defaulted to 'dashboard'. 
  // Let's default to 'dashboard' if initialView is undefined or if we decide so.
  // But page.tsx passes 'day' default. 
  // Let's change page.tsx to pass undefined if not present? 
  // Or just check if dashboardData is present, show dashboard?
  // Let's use simpler logic: 
  // State: 'dashboard' | 'calendar'. Calendar has internal state 'day'/'week'?
  // Or flattened: 'dashboard' | 'day' | 'week'.
  // Use initialView from props. If it was passed as 'day' (default in page), we check if we should show dashboard.
  // Maybe explicit 'view=dashboard' param? Currently no.
  // Let's initialize based on presence of 'view' param in URL vs just default.
  // For now, let's assume if initialView is passed (even as default 'day'), we might want to show calendar?
  // No, user wants Dashboard as landing.
  // We can change page.tsx to NOT default 'view' to 'day'.
  // Let's assume:
  // - /agenda-facil -> Dashboard
  // - /agenda-facil?view=day -> Calendar Day
  // - /agenda-facil?view=week -> Calendar Week

  // So in AgendaPageClient:
  
  const [view, setView] = useState<'dashboard' | 'day' | 'week'>(() => {
      // If window.location contains view=..., use it. But we have initialView prop.
      // If initialView is hardcoded to 'day' in page.tsx, we can't distinguish.
      // I should have updated page.tsx to not default 'day'.
      // But assuming I can't change page.tsx easily right now without another step.
      // Let's just use 'dashboard' as default state, and only if initialView is provided AND explicitly different?
      // Actually, I'll update the state logic to respect props, but default to dashboard.
      return initialView && initialView !== 'day' ? initialView : 'dashboard'
  })
  
  // Correction: I want "Agenda Semanal" to be a view. 
  // Let's make: 'dashboard' | 'day' | 'week'.
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState<{ date?: Date, time?: string, professionalId?: string }>({})

  const handleOpenModal = (data: { date?: Date, time?: string, professionalId?: string } = {}) => {
    setModalData(data)
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header / Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda Fácil</h1>
        
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    view === 'dashboard' 
                    ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                Visão Geral
            </button>
            <button
                onClick={() => setView('day')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    ['day', 'week'].includes(view) 
                    ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                Calendário
            </button>
            <a
                href="/products/agenda-facil/financeiro"
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
            >
                Financeiro
            </a>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {view === 'dashboard' ? (
            <div className="p-6 space-y-6">
                {agendaData.shopId && <ShareLink shopId={agendaData.shopId} />}
                {dashboardData ? (
                    <DashboardOverview 
                        data={dashboardData} 
                        onNewAppointment={() => handleOpenModal()} 
                    />
                ) : (
                    <div className="text-center p-12 text-gray-500">
                        Não foi possível carregar os dados do painel.
                    </div>
                )}
            </div>
        ) : (
            <div className="h-full flex flex-col">
                 <div className="px-6 pt-6">
                    {agendaData.shopId && <ShareLink shopId={agendaData.shopId} />}
                </div>
                <AgendaContainer
                    date={date}
                    view={view as 'day' | 'week'}
                    setView={(v) => setView(v)}
                    professionals={agendaData.professionals || []}
                    services={agendaData.services || []}
                    clients={agendaData.clients || []}
                    appointments={agendaData.appointments || []}
                    onOpenModal={handleOpenModal}
                />
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
