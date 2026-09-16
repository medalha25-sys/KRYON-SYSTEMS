'use client'

import React, { useState, useMemo } from 'react'
import AgendaSidebar from '@/components/agenda/AgendaSidebar'
import { useRouter } from 'next/navigation'
import { NotificationLog } from '@/lib/notifications/types'

interface NotificationsClientProps {
  initialLogs: NotificationLog[]
  profile: any
  organization: any
}

export default function NotificationsClient({ initialLogs, profile, organization }: NotificationsClientProps) {
  const router = useRouter()
  const [logs] = useState<NotificationLog[]>(initialLogs)
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'reminders' | 'failed' | 'canceled'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const handleNavigation = (view: string) => {
    if (view === 'agenda') router.push('/products/agenda-facil')
    else if (view === 'dashboard') router.push('/products/agenda-facil?view=dashboard')
    else if (view === 'clients') router.push('/products/agenda-facil/clientes')
    else if (view === 'finance') router.push('/products/agenda-facil/financeiro')
    else if (view === 'settings') router.push('/products/agenda-facil/settings')
    else if (view === 'notifications') router.push('/products/agenda-facil/notificacoes')
  }

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = logs.length
    const sent = logs.filter(l => l.status === 'sent').length
    const reminders = logs.filter(l => l.notification_type === 'reminder_24h' || l.notification_type === 'reminder_2h').length
    const failed = logs.filter(l => l.status === 'failed').length
    const pending = logs.filter(l => l.status === 'pending').length
    const deliveryRate = total > 0 ? Math.round((sent / (sent + failed || 1)) * 100) : 100

    return { total, sent, reminders, failed, pending, deliveryRate }
  }, [logs])

  // Filtering
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Tab filter
      if (activeTab === 'sent' && log.status !== 'sent') return false
      if (activeTab === 'failed' && log.status !== 'failed') return false
      if (activeTab === 'reminders' && log.notification_type !== 'reminder_24h' && log.notification_type !== 'reminder_2h') return false
      if (activeTab === 'canceled' && log.notification_type !== 'booking_canceled') return false

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const nameMatch = log.recipient_name?.toLowerCase().includes(query)
        const contactMatch = log.recipient_contact?.toLowerCase().includes(query)
        const serviceMatch = log.metadata?.service?.toLowerCase().includes(query)
        if (!nameMatch && !contactMatch && !serviceMatch) return false
      }

      return true
    })
  }, [logs, activeTab, searchTerm])

  const formatTimestamp = (isoString?: string | null) => {
    if (!isoString) return '-'
    const d = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'booking_created':
      case 'booking_confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
            Confirmação
          </span>
        )
      case 'reminder_24h':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
            Lembrete 24h
          </span>
        )
      case 'reminder_2h':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
            Lembrete 2h
          </span>
        )
      case 'booking_canceled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">
            Cancelamento
          </span>
        )
      case 'booking_rescheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
            Remarcação
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
            {type}
          </span>
        )
    }
  }

  const getStatusBadge = (status: string, error?: string | null) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Enviado
          </span>
        )
      case 'failed':
        return (
          <span 
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md"
            title={error || 'Falha no envio'}
          >
            <span className="material-symbols-outlined text-sm">error</span>
            Falha
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
            <span className="material-symbols-outlined text-sm">schedule</span>
            Pendente
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Sidebar */}
      <AgendaSidebar 
        currentView="notifications" 
        onChangeView={handleNavigation}
        userName={profile?.full_name || 'Usuário'}
        organizationName={organization?.name || 'Clínica'}
        organizationLogo={organization?.logo_url}
        whiteLabelEnabled={organization?.white_label_enabled}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Central de Notificações e Lembretes</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                Multi-Tenant
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Histórico de confirmações e lembretes automáticos enviados aos pacientes de {organization?.name || 'sua clínica'}.
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Enviadas</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{metrics.sent}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">✓ Entrega via Resend</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                <span className="material-symbols-outlined text-2xl">mark_email_read</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lembretes 24h / 2h</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{metrics.reminders}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Rotina Cron Server-side</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                <span className="material-symbols-outlined text-2xl">alarm_on</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Taxa de Sucesso</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{metrics.deliveryRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Proteção contra duplicidade</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Falhas / Pendentes</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-red-500 mt-1">{metrics.failed}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{metrics.pending} pendentes</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-500 rounded-xl">
                <span className="material-symbols-outlined text-2xl">error_outline</span>
              </div>
            </div>

          </div>

          {/* Table Controls & Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Tab Filters */}
              <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 dark:bg-gray-900/60 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Todos ({logs.length})
                </button>
                <button
                  onClick={() => setActiveTab('sent')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                    activeTab === 'sent'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Enviados ({metrics.sent})
                </button>
                <button
                  onClick={() => setActiveTab('reminders')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                    activeTab === 'reminders'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Lembretes ({metrics.reminders})
                </button>
                <button
                  onClick={() => setActiveTab('canceled')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                    activeTab === 'canceled'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Cancelamentos
                </button>
                <button
                  onClick={() => setActiveTab('failed')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                    activeTab === 'failed'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Falhas ({metrics.failed})
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-64">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
                <input
                  type="text"
                  placeholder="Buscar por paciente ou contato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Destinatário</th>
                    <th className="py-3.5 px-4">Tipo de Evento</th>
                    <th className="py-3.5 px-4">Canal</th>
                    <th className="py-3.5 px-4">Detalhes da Consulta</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Data / Hora de Envio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750 transition">
                        
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {log.recipient_name || 'Paciente'}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            {log.recipient_contact}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {getTypeBadge(log.notification_type)}
                        </td>

                        <td className="py-3.5 px-4">
                          {log.channel === 'email' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 font-medium">
                              <span className="material-symbols-outlined text-base">mail</span>
                              E-mail (Resend)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                              <span className="material-symbols-outlined text-base">chat</span>
                              WhatsApp
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                          {log.metadata?.service ? (
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">{log.metadata.service}</span>
                              {log.metadata.professional && (
                                <span className="text-gray-500 block text-[11px]">com {log.metadata.professional}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {getStatusBadge(log.status, log.error_message)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-[11px] text-gray-600 dark:text-gray-400">
                          {formatTimestamp(log.sent_at || log.created_at)}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="max-w-sm mx-auto">
                          <span className="material-symbols-outlined text-4xl text-gray-400 mb-2 block">mark_email_unread</span>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">Nenhuma notificação encontrada</p>
                          <p className="text-xs text-gray-500 mt-1">
                            As notificações e lembretes automáticos aparecerão aqui assim que novos agendamentos forem realizados ou lembretes forem disparados pelo servidor.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </main>
      </div>

    </div>
  )
}
