'use client'

import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
// If the above still fails in the build, we might need to import it differently or check the node_modules
import { Calendar as CalendarIcon, Clock, Truck, MapPin, User, Info, Bell, Volume2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeliveryCalendarProps {
    initialDeliveries: any[]
}

export default function DeliveryCalendarClient({ initialDeliveries }: DeliveryCalendarProps) {
    const [events, setEvents] = useState<any[]>([])

    useEffect(() => {
        const formattedEvents = initialDeliveries.map(d => ({
            id: d.id,
            title: `Entrega #${d.ordem_producao_id?.slice(0, 4) || 'S/N'}`,
            start: d.data_entrega || d.data_saida,
            backgroundColor: getStatusColor(d.status),
            borderColor: getStatusColor(d.status),
            extendedProps: {
                status: d.status,
                motorista: d.erp_drivers?.nome || 'Não atribuído',
                caminhao: d.erp_trucks?.placa || 'Sem placa',
                volume: d.volume_transportado_m3
            }
        }))
        setEvents(formattedEvents)
    }, [initialDeliveries])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'entregue': return '#10b981' // emerald-500
            case 'em_transporte': return '#3b82f6' // blue-500
            case 'cancelada': return '#ef4444' // red-500
            default: return '#f97316' // orange-500 (agendada)
        }
    }

    const handleEventClick = (info: any) => {
        const props = info.event.extendedProps
        toast.info(
            <div className="space-y-2 py-1">
                <p className="font-bold border-b border-slate-700 pb-1 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <Truck className="w-3 h-3" /> Detalhes da Entrega
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                    <p className="text-slate-500 uppercase font-black">Motorista</p>
                    <p className="text-slate-200">{props.motorista}</p>
                    <p className="text-slate-500 uppercase font-black">Caminhão</p>
                    <p className="text-slate-200">{props.caminhao}</p>
                    <p className="text-slate-500 uppercase font-black">Volume</p>
                    <p className="text-slate-200">{Number(props.volume).toFixed(2)} m³</p>
                    <p className="text-slate-500 uppercase font-black">Status</p>
                    <p className="font-bold" style={{ color: getStatusColor(props.status) }}>{props.status.toUpperCase()}</p>
                </div>
            </div>,
            { duration: 5000 }
        )
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white italic uppercase tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-slate-900 border border-slate-800 rounded-lg shadow-lg">
                            <CalendarIcon className="w-6 h-6 text-orange-500" />
                        </span>
                        Agenda de Entregas
                    </h1>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-2">Logística em Tempo Real // Planejamento Industrial</p>
                </div>

                <div className="flex items-center gap-2">
                   <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-inner">
                        <div className="px-3 py-1.5 flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 border-r border-slate-800">
                            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"></span> Agendada
                        </div>
                        <div className="px-3 py-1.5 flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 border-r border-slate-800">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></span> Em Trânsito
                        </div>
                        <div className="px-3 py-1.5 flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span> Concluída
                        </div>
                   </div>
                </div>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden calendar-container">
                <style jsx global>{`
                    .calendar-container .fc {
                        --fc-border-color: #1e293b;
                        --fc-button-bg-color: #1e293b;
                        --fc-button-border-color: #334155;
                        --fc-button-hover-bg-color: #334155;
                        --fc-button-active-bg-color: #f97316;
                        --fc-button-active-border-color: #f97316;
                        --fc-page-bg-color: transparent;
                        --fc-neutral-bg-color: #0f172a;
                        --fc-list-event-hover-bg-color: #1e293b;
                        --fc-today-bg-color: rgba(59, 130, 246, 0.05);
                        font-family: inherit;
                    }
                    .calendar-container .fc-toolbar-title {
                        font-weight: 900 !important;
                        text-transform: uppercase !important;
                        font-style: italic !important;
                        letter-spacing: -0.025em !important;
                        color: white !important;
                        font-size: 1.25rem !important;
                    }
                    .calendar-container .fc-col-header-cell-cushion {
                        font-weight: 800;
                        text-transform: uppercase;
                        font-size: 10px;
                        letter-spacing: 0.1em;
                        color: #64748b;
                        padding: 10px 0;
                    }
                    .calendar-container .fc-daygrid-day-number {
                        font-weight: 700;
                        font-family: monospace;
                        font-size: 12px;
                        color: #94a3b8;
                    }
                    .calendar-container .fc-event {
                        border-radius: 6px;
                        padding: 2px 4px;
                        font-weight: 700;
                        font-size: 10px;
                        text-transform: uppercase;
                        cursor: pointer;
                        border: none !important;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    }
                `}</style>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    locale={ptBrLocale}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={events}
                    eventClick={handleEventClick}
                    height="auto"
                />
            </div>
        </div>
    )
}
