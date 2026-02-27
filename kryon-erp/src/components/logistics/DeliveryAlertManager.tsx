'use client'

import React, { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Bell, Truck } from 'lucide-react'

export default function DeliveryAlertManager() {
    const lastAlertedRef = useRef<Set<string>>(new Set())
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const supabase = createClient()

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3') // Tech alert sound
        
        const checkDeliveries = async () => {
            const settingsStr = localStorage.getItem('concrete-erp-settings')
            const settings = settingsStr ? JSON.parse(settingsStr) : { notificationsEnabled: true, soundEnabled: true, alertTimeMinutes: 15 }

            if (!settings.notificationsEnabled && !settings.soundEnabled) return

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
            if (!profile) return

            const now = new Date()
            const alertThreshold = new Date(now.getTime() + settings.alertTimeMinutes * 60000)

            const { data: deliveries } = await supabase
                .from('erp_deliveries')
                .select('*, erp_drivers(nome)')
                .eq('organization_id', profile.organization_id)
                .eq('status', 'agendada')
                .gte('data_entrega', now.toISOString())
                .lte('data_entrega', alertThreshold.toISOString())

            if (deliveries && deliveries.length > 0) {
                deliveries.forEach(delivery => {
                    if (!lastAlertedRef.current.has(delivery.id)) {
                        triggerAlert(delivery, settings)
                        lastAlertedRef.current.add(delivery.id)
                    }
                })
            }
        }

        const triggerAlert = (delivery: any, settings: any) => {
            const message = `Entrega agendada para agora! Motorista: ${delivery.erp_drivers?.nome || 'N/A'}`

            // 1. Toast Alert
            toast.error(
                <div className="flex flex-col gap-1">
                    <p className="font-bold flex items-center gap-2">
                        <Bell className="w-4 h-4 animate-bounce text-orange-500" /> 
                        ALERTA DE ENTREGA
                    </p>
                    <p className="text-xs">{message}</p>
                </div>,
                { duration: 10000 }
            )

            // 2. Sound Alert
            if (settings.soundEnabled && audioRef.current) {
                audioRef.current.play().catch(e => console.log('Audio play failed:', e))
            }

            // 3. Browser Notification
            if (settings.notificationsEnabled && Notification.permission === 'granted') {
                new Notification('Concrete ERP: Alerta de Entrega', {
                    body: message,
                    icon: '/favicon.ico'
                })
            }
        }

        const interval = setInterval(checkDeliveries, 30000) // Check every 30s
        checkDeliveries() // Initial check

        return () => clearInterval(interval)
    }, [supabase])

    return null // Invisible component
}
