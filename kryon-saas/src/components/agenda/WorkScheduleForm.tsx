'use client'

import React, { useState, useEffect } from 'react'
import { WorkSchedule, Professional } from '@/types/agenda'
import { getWorkSchedules, saveWorkScheduleAction } from '../../app/products/agenda-facil/profissionais/schedule-actions'
import { toast } from 'sonner'

interface WorkScheduleFormProps {
  professional: Professional
  onClose: () => void
}

interface WorkScheduleUI extends Partial<WorkSchedule> {
    ui_active: boolean
    weekday: number
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function WorkScheduleForm({ professional, onClose }: WorkScheduleFormProps) {
  const [schedules, setSchedules] = useState<WorkScheduleUI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getWorkSchedules(professional.id)
      
      // Initialize with existing data or defaults
      const initialSchedules: WorkScheduleUI[] = DAYS.map((_, index) => {
        const existing = data.find(s => s.weekday === index)
        return {
          weekday: index,
          professional_id: professional.id,
          start_time: existing?.start_time || '08:00',
          end_time: existing?.end_time || '18:00',
          break_start: existing?.break_start || '',
          break_end: existing?.break_end || '',
          ui_active: !!existing
        }
      })
      
      setSchedules(initialSchedules)
      setLoading(false)
    }
    load()
  }, [professional.id])

  const handleToggleDay = (index: number) => {
    const newSchedules = [...schedules]
    newSchedules[index] = { ...newSchedules[index], ui_active: !newSchedules[index].ui_active }
    setSchedules(newSchedules)
  }

  const handleChange = (index: number, field: keyof WorkScheduleUI, value: string) => {
    const newSchedules = [...schedules]
    newSchedules[index] = { ...newSchedules[index], [field]: value }
    setSchedules(newSchedules)
  }

  const handleSave = async () => {
    setLoading(true)
    const activeSchedules = schedules.filter(s => s.ui_active)
    
    // Validation
    for (const s of activeSchedules) {
        if (s.start_time! >= s.end_time!) {
            toast.error(`${DAYS[s.weekday]} : Horário final deve ser maior que inicial`)
            setLoading(false)
            return
        }
    }

    // Map UI type back to Partial<WorkSchedule> for saving
    const schedulesToSave: Partial<WorkSchedule>[] = activeSchedules.map(s => ({
        weekday: s.weekday,
        start_time: s.start_time,
        end_time: s.end_time,
        break_start: s.break_start,
        break_end: s.break_end
    }))

    const res = await saveWorkScheduleAction(professional.id, schedulesToSave)
    setLoading(false)
    
    if (res.error) {
        toast.error(res.error)
    } else {
        toast.success('Horários salvos com sucesso!')
        onClose()
    }
  }

  if (loading && schedules.length === 0) return <div className="p-4">Carregando horários...</div>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-xl font-bold">Horários de Trabalho - {professional.name}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6 space-y-4">
            {schedules.map((schedule, index) => (
                <div key={index} className={`flex flex-wrap items-center gap-4 p-3 rounded border ${schedule.ui_active ? 'border-primary/30 bg-primary/5' : 'border-gray-200 dark:border-gray-700 opacity-60'}`}>
                    <div className="w-32 flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            checked={schedule.ui_active} 
                            onChange={() => handleToggleDay(index)}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="font-semibold">{DAYS[index]}</span>
                    </div>

                    {schedule.ui_active && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Das</span>
                                <input 
                                    type="time" 
                                    value={schedule.start_time} 
                                    onChange={(e) => handleChange(index, 'start_time', e.target.value)}
                                    className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="text-xs text-gray-500">às</span>
                                <input 
                                    type="time" 
                                    value={schedule.end_time} 
                                    onChange={(e) => handleChange(index, 'end_time', e.target.value)}
                                    className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <div className="flex items-center gap-2 border-l pl-4 dark:border-gray-600">
                                <span className="text-xs text-gray-500">Pausa:</span>
                                <input 
                                    type="time" 
                                    value={schedule.break_start || ''} 
                                    onChange={(e) => handleChange(index, 'break_start', e.target.value)}
                                    className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="text-xs text-gray-500">até</span>
                                <input 
                                    type="time" 
                                    value={schedule.break_end || ''} 
                                    onChange={(e) => handleChange(index, 'break_end', e.target.value)}
                                    className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>

        <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-900 sticky bottom-0">
             <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded">Cancelar</button>
             <button 
                onClick={handleSave} 
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
             >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
             </button>
        </div>
      </div>
    </div>
  )
}
