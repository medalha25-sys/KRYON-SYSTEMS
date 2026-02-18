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
                organizationLogo={organization.logo_url}
                organizationName={organization.name}
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
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Agendamento Online</h2>
                            <p className="text-sm text-gray-500 mb-6">Configure como seus clientes agendam horários online.</p>

                            <form action={handleSave} className="space-y-6">
                                
                                <div className="flex items-center justify-between">
                                     <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Permitir agendamento online</label>
                                     <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input 
                                            type="checkbox" 
                                            name="public_booking_enabled" 
                                            id="toggle" 
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                            defaultChecked={organization.public_booking_enabled}
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
                                                defaultValue={organization.primary_color || '#3b82f6'}
                                                className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                                            />
                                            <span className="text-xs text-gray-500">Usada para botões e destaques.</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor Secundária</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                name="secondary_color" 
                                                defaultValue={organization.secondary_color || '#1d4ed8'}
                                                className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                                            />
                                            <span className="text-xs text-gray-500">Usada para detalhes.</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensagem de Boas-vindas</label>
                                    <input 
                                        type="text" 
                                        name="welcome_message" 
                                        defaultValue={organization.welcome_message || ''}
                                        placeholder="Ex: Agende seu horário com a Clínica Serena"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <div className="text-sm">
                                        <span className="text-gray-500">Link público: </span>
                                        {organization.slug ? (
                                            <Link href={`/book/${organization.slug}`} target="_blank" className="text-blue-600 hover:underline">
                                                /book/{organization.slug}
                                            </Link>
                                        ) : (
                                            <span className="text-red-500">Slug não configurado</span>
                                        )}
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
                                    >
                                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>

                            </form>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    )
}
