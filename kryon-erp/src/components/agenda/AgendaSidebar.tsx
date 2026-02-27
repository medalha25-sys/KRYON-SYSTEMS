'use client'

import React from 'react'

interface AgendaSidebarProps {
  currentView: string
  onChangeView: (view: string) => void
  userName: string
  userImage?: string
  organizationLogo?: string
  whiteLabelEnabled?: boolean
  organizationName?: string
}

export default function AgendaSidebar({ currentView, onChangeView, userName, userImage, organizationLogo, whiteLabelEnabled, organizationName }: AgendaSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: 'grid_view' },
    { id: 'agenda', label: 'Agenda', icon: 'calendar_month' },
    { id: 'clients', label: 'Pacientes', icon: 'groups' },
    { id: 'finance', label: 'Financeiro', icon: 'payments' },
    { id: 'settings', label: 'Configurações', icon: 'settings' },
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col flex-shrink-0">
      
      {/* Brand Section */}
      <div className="p-6 flex items-center justify-center border-b border-gray-50 dark:border-gray-700">
         {organizationLogo ? (
             <img src={organizationLogo} alt={organizationName} className="h-10 object-contain" />
         ) : (
             // Default to local logo if no custom one, or text if white-label enabled but no logo (which is edge case)
             // Actually, if white-label IS enabled and NO logo, we probably show Clinic Name.
             // If white-label is NOT enabled, we show 'Clínica Serena' logo.
             !whiteLabelEnabled ? (
                 <div className="flex items-center gap-2">
                     <img src="/logo-clinica.png" alt="Clínica Serena" className="h-24 object-contain" onError={(e) => {
                         // Fallback if image not found
                         e.currentTarget.style.display = 'none';
                         e.currentTarget.nextElementSibling?.classList.remove('hidden');
                     }}/> 
                     <span className="hidden text-lg font-bold text-gray-700 dark:text-white">Clínica Serena</span>
                 </div>
             ) : (
                <h2 className="text-lg font-bold text-gray-700 dark:text-white">{organizationName || 'Minha Clínica'}</h2>
             )
         )}
      </div>

      {/* Profile Section */}
      <div className="p-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold overflow-hidden shrink-0">
             {userImage ? (
                 <img src={userImage} alt={userName} className="w-full h-full object-cover" />
             ) : (
                 <span>{userName.substring(0, 2).toUpperCase()}</span>
             )}
        </div>
        <div className="overflow-hidden">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{userName}</h3>
            <p className="text-xs text-gray-500 truncate">Psicólogo Clínico</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map(item => (
            <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${
                    currentView === item.id 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
            </button>
        ))}
      </nav>

      {/* Logout & Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
         <button className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition font-medium text-sm mb-4">
             <span className="material-symbols-outlined text-[20px]">logout</span>
             Sair
         </button>
         
         {!whiteLabelEnabled && (
             <div className="text-center">
                 <p className="text-[10px] text-gray-400 font-medium">Powered by</p>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Clínica Serena</p>
             </div>
         )}
      </div>
    </div>
  )
}
