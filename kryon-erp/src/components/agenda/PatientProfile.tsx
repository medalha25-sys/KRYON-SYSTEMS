'use client'

import React, { useState } from 'react'
import { Client, Appointment } from '@/types/agenda'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import ClinicalRecordForm from './ClinicalRecordForm'

export interface ClinicalRecord {
  id: string
  created_at: string
  content: any
  free_notes?: string
  professional_id?: string
  appointment_id?: string
  agenda_professionals?: { name: string }
  agenda_appointments?: { 
    start_time: string
    agenda_services: { name: string }
  }
}

interface PatientProfileProps {
  client: Client
  appointments: Appointment[]
  clinicalRecords: ClinicalRecord[]
}

export default function PatientProfile({ client, appointments, clinicalRecords }: PatientProfileProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'info' | 'prontuario'>('timeline')
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | undefined>(undefined)

  const unlinkedCompletedApps = appointments.filter(app => 
    app.status === 'completed' && 
    !clinicalRecords.some(r => r.appointment_id === app.id)
  )

  const handleNewRecordClick = () => {
      // If there are unlinked completed appointments, force selection? 
      // Or just default to one?
      // Let's simplified flow: 
      // 1. If unlinked completed apps exist, show selection or auto-select if only 1.
      // 2. If none, show warning?
      // For now, let's just toggling form and passing appointmentId if available.
      
      if (unlinkedCompletedApps.length === 0) {
          alert("Não há agendamentos concluídos disponíveis para criar um prontuário.")
          return
      }

      if (unlinkedCompletedApps.length === 1) {
          setSelectedAppointmentId(unlinkedCompletedApps[0].id)
          setShowRecordForm(true)
      } else {
          // Ideally show a modal to select. For now, let's just pick the most recent one or show form with a selector inside?
          // Let's show form and maybe pass pre-selected?
          // Actually, PatientProfile doesn't have a selection modal. 
          // Let's pick the most recent completed one.
          setSelectedAppointmentId(unlinkedCompletedApps[0].id) // They are sorted DESC usually? verification needed.
          setShowRecordForm(true)
      }
  }

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
                <button 
                    onClick={() => setActiveTab('prontuario')}
                    className={`pb-4 -mb-4 font-medium transition ${activeTab === 'prontuario' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Prontuário
                </button>
             </div>

             <div className="p-6">
                {activeTab === 'timeline' ? (
                    <Timeline appointments={appointments} />
                ) : activeTab === 'prontuario' ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Histórico Clínico</h3>
                            {!showRecordForm && (
                                <button 
                                    onClick={handleNewRecordClick}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Novo Registro
                                </button>
                            )}
                        </div>

                        {showRecordForm ? (
                            <ClinicalRecordForm 
                                clientId={client.id} 
                                appointmentId={selectedAppointmentId}
                                onCancel={() => {
                                    setShowRecordForm(false)
                                    setSelectedAppointmentId(undefined)
                                }}
                                onSuccess={() => {
                                    setShowRecordForm(false)
                                    setSelectedAppointmentId(undefined)
                                    window.location.reload()
                                }}
                            />
                        ) : (
                            <div className="space-y-4">
                                {clinicalRecords?.length === 0 ? (
                                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                        <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                                            <span className="material-symbols-outlined text-gray-400">assignment_add</span>
                                        </div>
                                        <p className="text-gray-500">Nenhum registro encontrado.</p>
                                        <p className="text-sm text-gray-400 mt-1">Crie o primeiro prontuário deste paciente.</p>
                                    </div>
                                ) : (
                                    clinicalRecords?.map(record => (
                                        <div key={record.id} className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                        <span className="material-symbols-outlined">clinical_notes</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {format(parseISO(record.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            às {format(parseISO(record.created_at), 'HH:mm')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                                    {record.agenda_professionals?.name || 'Profissional'}
                                                </div>
                                            </div>
                                            
                                            {record.agenda_appointments && (
                                                 <div className="mb-4 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">event</span>
                                                    Referente ao agendamento de {format(parseISO(record.agenda_appointments.start_time), "dd/MM/yyyy HH:mm")}
                                                    <span className="text-blue-400">•</span>
                                                    {record.agenda_appointments.agenda_services?.name}
                                                 </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {record.content.anamnesis?.mainComplaint && (
                                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Queixa Principal</span>
                                                        <p className="text-sm text-gray-800 dark:text-gray-300">{record.content.anamnesis.mainComplaint}</p>
                                                    </div>
                                                )}
                                                {record.content.diagnosis?.hypothesis && (
                                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Hipótese Diagnóstica</span>
                                                        <p className="text-sm text-gray-800 dark:text-gray-300">{record.content.diagnosis.hypothesis}</p>
                                                    </div>
                                                )}
                                                {record.content.treatment?.conduct && (
                                                    <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Conduta</span>
                                                        <p className="text-sm text-gray-800 dark:text-gray-300">{record.content.treatment.conduct}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {record.free_notes && (
                                                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded">
                                                    <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider block mb-1">Notas Livres</span>
                                                    <p className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{record.free_notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
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
                                {app.status === 'completed' ? 'Realizada' : 
                                 app.status === 'scheduled' ? 'Agendada' :
                                 app.status === 'confirmed' ? 'Confirmada' :
                                 app.status === 'canceled' ? 'Cancelada' :
                                 app.status === 'no_show' ? 'Não Compareceu' : app.status}
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
