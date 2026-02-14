'use client'

import React, { useState } from 'react'
import { Client, Appointment } from '@/types/agenda'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PatientProfileProps {
  client: Client
  appointments: Appointment[]
}

export default function PatientProfile({ client, appointments }: PatientProfileProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'info'>('timeline')

  // Stats
  const totalSessions = appointments.filter(a => a.status === 'completed').length
  const noShows = appointments.filter(a => a.status === 'no_show').length
  
  const futureAppointments = appointments.filter(a => new Date(a.start_time) > new Date())
  const nextAppointment = futureAppointments.length > 0 
    ? futureAppointments[futureAppointments.length - 1] // appointments are desc, so last is earliest future? No, desc means Future -> Past.
    // Actually if desc: [2025, 2024, 2023]. Future ones are at top.
    // Find last one that is > now? 
    // Let's re-sort filtering.
    : null
    
  // Correct logic for next appointment from descending list:
  // We want the *smallest* date that is > now.
  // Since list is DESC (News -> Oldest), we want the one closest to now from the "Future" set.
  // The "Future" set is at the beginning of the list if we sorted DESC?
  // 10 Jan, 9 Jan, 8 Jan. Today is 9 Jan.
  // Future: 10 Jan.
  // Next is the *last* item of the future subset if we traverse from future to past? 
  // Wait, if 12 Jan, 11 Jan, 10 Jan. 
  // Closest is 10 Jan. It's the *last* of the future items in a descending list? No, it's the *last* item if we filter > now.
  // Let's simplify:
  const sortedFuture = appointments
    .filter(a => new Date(a.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  
  const nextAppt = sortedFuture[0]


  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
                <p className="text-gray-500">{client.email} • {client.phone}</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Editar Perfil
            </button>
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow">
                Nova Sessão
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total de Sessões" value={totalSessions} icon="check_circle" />
          <StatCard label="Faltas" value={noShows} icon="cancel" color="text-red-500" />
          <StatCard 
            label="Próxima Sessão" 
            value={nextAppt ? format(parseISO(nextAppt.start_time), 'dd/MM HH:mm') : '-'}
            subtext={nextAppt?.agenda_services?.name} 
            icon="event" 
            color="text-blue-500"
          />
          <StatCard label="Status Financeiro" value="Em dia" icon="attach_money" color="text-green-500" />
      </div>

      {/* Tabs & Content */}
      <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Content (Timeline) */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 min-h-[500px]">
             <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-6">
                <button 
                    onClick={() => setActiveTab('timeline')}
                    className={`pb-4 -mb-4 font-medium transition ${activeTab === 'timeline' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Evolução (Timeline)
                </button>
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`pb-4 -mb-4 font-medium transition ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Dados do Paciente
                </button>
             </div>

             <div className="p-6">
                {activeTab === 'timeline' ? (
                    <Timeline appointments={appointments} />
                ) : (
                    <div className="p-4 text-gray-500">
                        {/* Reuse ClientModal form logic or simple display here */}
                        <p>Detalhes do paciente aparecerão aqui.</p>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-500">Nome</label>
                                <p className="font-medium">{client.name}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Telefone</label>
                                <p className="font-medium">{client.phone || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Email</label>
                                <p className="font-medium">{client.email || '-'}</p>
                            </div>
                             <div className="col-span-2">
                                <label className="text-sm text-gray-500">Notas Gerais</label>
                                <p className="font-medium bg-gray-50 dark:bg-gray-900 p-3 rounded">{client.notes || 'Nenhuma nota registrada.'}</p>
                            </div>
                        </div>
                    </div>
                )}
             </div>
          </div>

          {/* Quick Info / Sidebar (could be used for something else or removed if layout is full width) */}
      </div>
    </div>
  )
}

function StatCard({ label, value, subtext, icon, color = "text-gray-400" }: { label: string, value: string | number, subtext?: string, icon: string, color?: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-full bg-gray-50 dark:bg-gray-700 ${color}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
        </div>
    )
}

import { updateAppointmentNote } from '@/app/products/agenda-facil/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// ... (PatientProfile component remains same, just update Timeline)

function Timeline({ appointments }: { appointments: Appointment[] }) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [noteText, setNoteText] = useState('')
    const router = useRouter()

    if (appointments.length === 0) {
        return <div className="text-center py-12 text-gray-500">Nenhum histórico encontrado.</div>
    }

    const handleStartEdit = (app: Appointment) => {
        setEditingId(app.id)
        setNoteText(app.notes || '')
    }

    const handleSave = async (id: string) => {
        const res = await updateAppointmentNote(id, noteText)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Anotação atualizada!')
            setEditingId(null)
            router.refresh()
        }
    }

    return (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {appointments.map((app) => (
                <div key={app.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    
                    {/* Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <span className="material-symbols-outlined text-sm">event_note</span>
                    </div>
                    
                    {/* Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700 shadow">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{format(parseISO(app.start_time), 'dd/MM/yyyy')} <span className="text-gray-400 font-normal text-sm">às {format(parseISO(app.start_time), 'HH:mm')}</span></div>
                            <span className={`text-xs px-2 py-0.5 rounded ${app.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {app.status === 'completed' ? 'Realizada' : app.status}
                            </span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                            {app.agenda_services?.name} • {app.agenda_professionals?.name}
                        </div>
                        
                        {editingId === app.id ? (
                            <div className="mt-2">
                                <textarea 
                                    value={noteText} 
                                    onChange={(e) => setNoteText(e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 text-sm"
                                    rows={3}
                                    placeholder="Digite a evolução..."
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button 
                                        onClick={() => setEditingId(null)}
                                        className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={() => handleSave(app.id)}
                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => handleStartEdit(app)}
                                className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm text-gray-700 dark:text-gray-300 italic group-hover:bg-blue-50/50 transition-colors cursor-pointer border border-transparent hover:border-blue-200 relative"
                                title="Clique para editar"
                            >
                                 {app.notes || 'Adicionar anotação de evolução...'}
                                 <span className="material-symbols-outlined absolute top-2 right-2 text-gray-400 text-xs opacity-0 group-hover:opacity-100">edit</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
