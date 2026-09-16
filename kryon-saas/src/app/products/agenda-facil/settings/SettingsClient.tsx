'use client'

import React, { useState } from 'react'
import AgendaSidebar from '@/components/agenda/AgendaSidebar'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updatePublicBookingSettings } from './actions'
import Link from 'next/link'

interface SettingsClientProps {
    profile: any
    organization: any
}

export default function SettingsClient({ profile, organization }: SettingsClientProps) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [origin, setOrigin] = useState('')
    const [copied, setCopied] = useState(false)

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin)
        }
    }, [])

    const canonicalPath = organization?.slug ? `/book/${organization.slug}` : ''
    const fullCanonicalUrl = origin && canonicalPath ? `${origin}${canonicalPath}` : canonicalPath

    const handleCopyLink = async () => {
        if (!fullCanonicalUrl) return
        try {
            if (typeof window !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(fullCanonicalUrl)
                setCopied(true)
                toast.success('Link copiado com sucesso.')
                setTimeout(() => setCopied(false), 2500)
            }
        } catch (e) {
            toast.error('Erro ao copiar link para a área de transferência.')
        }
    }

    const handleNavigation = (view: string) => {
        if (view === 'agenda') router.push('/products/agenda-facil')
        // other links could be mapped here
        // For 'settings', we are here.
    }

    const handleSave = async (formData: FormData) => {
        setIsSaving(true)
        try {
            const result = await updatePublicBookingSettings(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Configurações salvas com sucesso!')
                router.refresh()
            }
        } catch (e) {
            toast.error('Erro ao salvar')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <AgendaSidebar 
                currentView="settings"
                onChangeView={handleNavigation}
                userName={profile.full_name}
                userImage={profile.avatar_url}
                organizationLogo={organization?.logo_url}
                organizationName={organization?.name}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Configurações</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{profile.full_name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{profile.role}</div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        
                        {/* Public Booking Settings */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 border border-gray-100 dark:border-gray-700 space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agendamento Online (Página Pública)</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure o link canônico e a identidade visual da página onde seus clientes agendam horários.</p>
                            </div>

                            {/* Canonical Booking Link Card */}
                            <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">link</span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Link Canônico Oficial</span>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Rota Pública: /book/[slug]</span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <code className="text-xs font-mono bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-2.5 rounded-lg flex-1 text-blue-700 dark:text-blue-300 truncate select-all">
                                        {fullCanonicalUrl || 'Slug não configurado'}
                                    </code>
                                    
                                    {organization?.slug && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={handleCopyLink}
                                                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm ${
                                                    copied
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-base">
                                                    {copied ? 'check' : 'content_copy'}
                                                </span>
                                                {copied ? 'Copiado!' : 'Copiar link'}
                                            </button>

                                            <Link
                                                href={`/book/${organization.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-base">open_in_new</span>
                                                <span>Abrir</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <form action={handleSave} className="space-y-6">
                                
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200/70 dark:border-gray-700">
                                     <div>
                                         <label htmlFor="toggle" className="text-sm font-semibold text-gray-800 dark:text-gray-200 block">Permitir agendamento online</label>
                                         <p className="text-xs text-gray-500 dark:text-gray-400">Ativa ou desativa a página pública de agendamento para clientes.</p>
                                     </div>
                                     <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input 
                                            type="checkbox" 
                                            name="public_booking_enabled" 
                                            id="toggle" 
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                            defaultChecked={organization?.public_booking_enabled}
                                        />
                                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor Primária</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                name="primary_color" 
                                                defaultValue={organization?.primary_color || '#3b82f6'}
                                                className="h-10 w-20 rounded border border-gray-300 cursor-pointer bg-white"
                                            />
                                            <span className="text-xs text-gray-500">Usada para botões, destaques e cabeçalho.</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor Secundária</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                name="secondary_color" 
                                                defaultValue={organization?.secondary_color || '#1d4ed8'}
                                                className="h-10 w-20 rounded border border-gray-300 cursor-pointer bg-white"
                                            />
                                            <span className="text-xs text-gray-500">Usada para detalhes e complementos.</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensagem de Boas-vindas</label>
                                    <input 
                                        type="text" 
                                        name="welcome_message" 
                                        defaultValue={organization?.welcome_message || ''}
                                        placeholder="Ex: Agende seu horário com a Clínica Serena de forma rápida e prática."
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-70 shadow-sm"
                                    >
                                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Notification Preferences Card */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 border border-gray-100 dark:border-gray-700 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">notifications_active</span>
                                        Notificações e Lembretes Automáticos
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Configure as mensagens e lembretes automáticos enviados aos pacientes da clínica.
                                    </p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                    Resend Ativo
                                </span>
                            </div>

                            <div className="space-y-3">
                                
                                <label className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200/70 dark:border-gray-700 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-900 transition">
                                    <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white block">Confirmação de Agendamento</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Envia e-mail automático com os detalhes da consulta assim que o agendamento é registrado.</span>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200/70 dark:border-gray-700 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-900 transition">
                                    <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white block">Lembrete de 24 Horas</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Disparado automaticamente pelo servidor 1 dia antes da consulta via rotina de cron.</span>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200/70 dark:border-gray-700 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-900 transition">
                                    <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white block">Lembrete de 2 Horas</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Lembrete pontual para comparecimento próximo ao horário da consulta.</span>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200/70 dark:border-gray-700 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-900 transition">
                                    <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white block">Aviso de Cancelamento e Remarcação</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Notifica o paciente de forma imediata quando houver alteração de horário ou cancelamento.</span>
                                    </div>
                                </label>

                            </div>

                            {/* WhatsApp Channel Integration Notice */}
                            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl shrink-0 mt-0.5">chat</span>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Canal WhatsApp (Em Preparação)</h4>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                                        A infraestrutura está desacoplada e preparada para disparo direto no WhatsApp assim que o provedor oficial for integrado.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

