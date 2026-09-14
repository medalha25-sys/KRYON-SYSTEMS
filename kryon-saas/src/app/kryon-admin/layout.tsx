import React from 'react'
import { Metadata } from 'next'
import { KryonAdminSidebar } from './components/KryonAdminSidebar'

export const metadata: Metadata = {
  title: 'Kryon Admin — Central de Controle',
  description: 'Central de Controle e Inteligência Executiva da Kryon Systems.',
}

export default function KryonAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar (Desktop Fixed / Mobile Drawer) */}
      <KryonAdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col pt-16 lg:pt-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}
