'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Volume2, Save, Shield, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

export default function ConfigPage() {
    const [settings, setSettings] = useState({
        notificationsEnabled: true,
        soundEnabled: true,
        alertTimeMinutes: 15,
    })

    useEffect(() => {
        const saved = localStorage.getItem('concrete-erp-settings')
        if (saved) {
            setSettings(JSON.parse(saved))
        }
    }, [])

    const handleSave = () => {
        localStorage.setItem('concrete-erp-settings', JSON.stringify(settings))
        toast.success('Configurações salvas com sucesso!')
        
        // Request notification permission if enabling
        if (settings.notificationsEnabled && Notification.permission !== 'granted') {
            Notification.requestPermission()
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <header>
                <h1 className="text-3xl font-bold text-white italic uppercase tracking-tight flex items-center gap-3">
                    <span className="p-2 bg-slate-900 border border-slate-800 rounded-lg shadow-lg">
                        <Shield className="w-6 h-6 text-orange-500" />
                    </span>
                    Configurações do Sistema
                </h1>
                <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-2">Personalize sua experiência industrial</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <Bell className="w-5 h-5 text-blue-400" />
                        <h3 className="font-bold uppercase text-sm tracking-wider text-slate-200">Alertas e Notificações</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-sm font-bold text-slate-200">Notificações Push</p>
                                    <p className="text-[10px] text-slate-500">Receba alertas mesmo com o navegador fechado</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={settings.notificationsEnabled}
                                    onChange={(e) => setSettings({...settings, notificationsEnabled: e.target.checked})}
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <Volume2 className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-sm font-bold text-slate-200">Alerta Sonoro</p>
                                    <p className="text-[10px] text-slate-500">Emitir som ao aproximar horário de entrega</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={settings.soundEnabled}
                                    onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <p className="text-sm font-bold text-slate-200 mb-2">Tempo de Antecipação</p>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="range" 
                                    min="5" 
                                    max="60" 
                                    step="5"
                                    className="flex-1 accent-orange-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                    value={settings.alertTimeMinutes}
                                    onChange={(e) => setSettings({...settings, alertTimeMinutes: parseInt(e.target.value)})}
                                />
                                <span className="text-sm font-mono font-black text-orange-500 w-12 text-center">{settings.alertTimeMinutes} min</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 italic">Avisar {settings.alertTimeMinutes} minutos antes da entrega agendada.</p>
                        </div>
                    </div>
                </section>

                <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            <h3 className="font-bold uppercase text-sm tracking-wider text-slate-200">Segurança do Módulo</h3>
                        </div>
                        <p className="text-xs text-slate-400">As configurações de notificações são salvas localmente neste dispositivo. Para receber alertas em outros aparelhos, configure-os individualmente.</p>
                        
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            <p className="text-[10px] text-emerald-500 font-black uppercase mb-1">Dica Pro</p>
                            <p className="text-xs text-slate-300">Mantenha a aba do sistema aberta em background no celular para garantir que os alertas de entrega funcionem em tempo real.</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        className="w-full mt-8 bg-orange-500 text-black py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-orange-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 group"
                    >
                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Salvar Configurações
                    </button>
                </section>
            </div>
        </div>
    )
}
