'use client'

import React from 'react'

interface AgendaSidebarProps {
  currentView: string
  onChangeView: (view: string) => void
  userName: string
  userImage?: string // URL or base64
}

export default function AgendaSidebar({ currentView, onChangeView, userName, userImage }: AgendaSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }, // Added dashboard explicitly? Desing has "Agenda" as active in screenshot 1? No, "Dr Silva" dashboard is screenshot 2.
    // Screenshot 1 is "Agenda". Screenshot 2 is "Dashboard" (Home).
    // Let's call Home 'dashboard'.
    // Screenshot 5 (Sidebar): Agenda, Pacientes, Configurações.
    // Does it have a "Dashboard" link? In screenshot 5, "Agenda" is active.
    // Screenshot 2 (Dashboard view) has "Agenda" button? No.
    // Maybe "Agenda" IS the Dashboard? 
    // Wait. "Dr. Silva - Dashboard.png" shows cards.
    // "Dr. Silva - Agenda.png" shows "Agenda Semanal".
    // I will assume:
    // 1. Dashboard (Visão Geral)
    // 2. Agenda (Calendário)
    // 3. Pacientes
    // 4. Configurações
    
    // But sidebar in screenshot 5 only shows: Agenda, Pacientes, Configurações.
    // Maybe "Agenda" leads to Dashboard/Calendar logic?
    // Let's stick to my mapped views:
    { id: 'dashboard', label: 'Visão Geral', icon: 'grid_view' },
    { id: 'agenda', label: 'Agenda', icon: 'calendar_month' },
    { id: 'clients', label: 'Pacientes', icon: 'groups' },
    { id: 'finance', label: 'Financeiro', icon: 'payments' }, // Keeping this
    { id: 'settings', label: 'Configurações', icon: 'settings' },
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col flex-shrink-0">
      
      {/* Profile Section */}
      <div className="p-6 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold overflow-hidden">
             {userImage ? (
                 <img src={userImage} alt={userName} className="w-full h-full object-cover" />
             ) : (
                 <span>{userName.substring(0, 2).toUpperCase()}</span>
             )}
        </div>
        <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{userName}</h3>
            <p className="text-xs text-gray-500">Psicólogo Clínico</p> {/* Mockup role, dynamic later */}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
            <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                    currentView === item.id 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
            </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
         <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition font-medium">
             <span className="material-symbols-outlined">logout</span>
             Sair
         </button>
      </div>
    </div>
  )
}
