'use client'

import { useState } from 'react'
import PatientProfile from './PatientProfile'
import PatientHistory from './PatientHistory'
import PatientRecords from './PatientRecords'
import { Client } from '@/types/agenda'

interface PatientTabsProps {
    client: Client
    appointments: any[]
    records: any[]
    userRole: string
}

export default function PatientTabs({ client, appointments, records, userRole }: PatientTabsProps) {
    const [activeTab, setActiveTab] = useState('profile')
    const isSecretary = userRole === 'secretary'

    const tabs = [
        { id: 'profile', label: 'Dados Pessoais', icon: 'person' },
        { id: 'history', label: 'Histórico', icon: 'history' },
        // Hide Records if Secretary
        ...(!isSecretary ? [{ id: 'records', label: 'Prontuários', icon: 'description' }] : [])
    ]

    return (
        <div>
            {/* Tabs Header */}
            <div className="flex border-b dark:border-gray-700 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                            ${activeTab === tab.id 
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}
                        `}
                    >
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tabs Content */}
            <div className="min-h-[400px]">
                {activeTab === 'profile' && <PatientProfile client={client} />}
                {activeTab === 'history' && <PatientHistory appointments={appointments} />}
                {activeTab === 'records' && !isSecretary && <PatientRecords records={records} />}
            </div>
        </div>
    )
}
