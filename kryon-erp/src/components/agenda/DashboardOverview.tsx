'use client'

import React from 'react'
import { format, parseISO, differenceInMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DashboardData {
    userName: string
    nextAppointment: any
    stats: {
        sessionsThisWeek: number
        sessionsLastWeek: number
        freeSlots: number
    }
    todaysAppointments: any[]
}

export default function DashboardOverview({ data, onNewAppointment }: { data: DashboardData, onNewAppointment: () => void }) {
    
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700'
            case 'confirmed': return 'bg-blue-100 text-blue-700'
            case 'scheduled': return 'bg-blue-50 text-blue-600'
            case 'canceled': return 'bg-red-100 text-red-700'
            case 'no_show': return 'bg-purple-100 text-purple-700'
            default: return 'bg-gray-100 text-gray-600'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Concluído'
            case 'confirmed': return 'Confirmado'
            case 'scheduled': return 'Agendado'
            case 'canceled': return 'Cancelado'
            case 'no_show': return 'Não compareceu'
            default: return status
        }
    }

    // Calculate percentage change
    const percentageChange = data.stats.sessionsLastWeek === 0 
        ? 100 
        : Math.round(((data.stats.sessionsThisWeek - data.stats.sessionsLastWeek) / data.stats.sessionsLastWeek) * 100)

    const nextApptTime = data.nextAppointment ? parseISO(data.nextAppointment.start_time) : null
    const minutesToNext = nextApptTime ? differenceInMinutes(nextApptTime, new Date()) : null
    
    let timeString = ''
    if (minutesToNext !== null) {
        if (minutesToNext < 0) timeString = 'Agora'
        else if (minutesToNext < 60) timeString = `Em ${minutesToNext} minutos`
        else timeString = `Em ${Math.floor(minutesToNext / 60)}h ${minutesToNext % 60}m`
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Olá, {data.userName}.</h1>
                    <p className="text-gray-500 text-lg">Hoje você tem {data.todaysAppointments.length} atendimentos agendados.</p>
                </div>
                <button 
                    onClick={onNewAppointment}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Novo Agendamento
                </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Next Consultation */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Próxima Consulta</span>
                        <div className="bg-blue-500 text-white p-1 rounded-full">
                           <span className="material-symbols-outlined text-sm">schedule</span>
                        </div>
                    </div>
                    {data.nextAppointment ? (
                        <>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {format(parseISO(data.nextAppointment.start_time), 'HH:mm')} - {data.nextAppointment.clients?.name.split(' ')[0]}
                            </h3>
                            <p className="text-gray-900 dark:text-white text-xl font-semibold mb-4">
                                {data.nextAppointment.clients?.name.split(' ').slice(1).join(' ')}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-blue-500 font-medium">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                {timeString}
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500">Nenhuma consulta agendada.</p>
                    )}
                </div>

                {/* 2. Sessions This Week */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sessões na semana</span>
                        <div className="bg-blue-50 text-blue-500 p-1 rounded-md">
                           <span className="material-symbols-outlined text-sm">bar_chart</span>
                        </div>
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{data.stats.sessionsThisWeek}</h3>
                    <div className={`text-xs font-bold ${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {percentageChange > 0 ? '+' : ''}{percentageChange}% em relação à última semana
                    </div>
                </div>

                 {/* 3. Free Slots */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Horários Livres</span>
                        <div className="bg-blue-50 text-blue-500 p-1 rounded-md">
                           <span className="material-symbols-outlined text-sm">calendar_today</span>
                        </div>
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{data.stats.freeSlots}</h3>
                    <p className="text-xs text-gray-400">Disponíveis para encaixe hoje</p>
                </div>
            </div>

            {/* Today's Agenda List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agenda de Hoje</h2>
                    <div className="flex gap-2">
                         <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400">
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                         </button>
                         <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                         </button>
                    </div>
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="col-span-2">Horário</div>
                        <div className="col-span-4">Paciente</div>
                        <div className="col-span-3">Modalidade</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1 text-right">Ações</div>
                    </div>

                    {data.todaysAppointments.length > 0 ? (
                        data.todaysAppointments.map((appt) => (
                            <div key={appt.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <div className="col-span-2 font-medium text-gray-600 dark:text-gray-300">
                                    {format(parseISO(appt.start_time), 'HH:mm')}
                                </div>
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold uppercase">
                                        {appt.clients?.name.substring(0,2)}
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">{appt.clients?.name}</span>
                                </div>
                                <div className="col-span-3">
                                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">
                                        {/* Assuming 'Presencial' based on service name or a new column. Defaulting for mockup. */}
                                        {appt.agenda_services?.name.toLowerCase().includes('online') ? 'Online' : 'Presencial'}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(appt.status)}`}>
                                        {getStatusLabel(appt.status)}
                                    </span>
                                </div>
                                <div className="col-span-1 text-right">
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <span className="material-symbols-outlined text-lg">more_horiz</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            Nenhum agendamento para hoje.
                        </div>
                    )}
                </div>
                
                {data.todaysAppointments.length > 0 && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-center">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            Ver agenda completa
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
