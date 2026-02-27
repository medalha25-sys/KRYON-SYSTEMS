'use client'

import React, { useState } from 'react'
import { createClinicalRecord, ClinicalRecordContent } from '@/app/products/agenda-facil/prontuario/actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ClinicalRecordFormProps {
  clientId: string
  appointmentId?: string
  professionalId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ClinicalRecordForm({ 
  clientId, 
  appointmentId, 
  professionalId, 
  onSuccess, 
  onCancel 
}: ClinicalRecordFormProps) {
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<'anamnesis' | 'diagnosis' | 'treatment' | 'notes'>('anamnesis')
  
  const [formData, setFormData] = useState<ClinicalRecordContent>({
    anamnesis: { mainComplaint: '', history: '' },
    diagnosis: { hypothesis: '', cid: '' },
    treatment: { conduct: '', prescription: '' }
  })
  const [freeNotes, setFreeNotes] = useState('')

  const handleContentChange = (
    section: keyof ClinicalRecordContent, 
    field: string, 
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createClinicalRecord({
        client_id: clientId,
        appointment_id: appointmentId,
        professional_id: professionalId,
        content: formData,
        free_notes: freeNotes
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Prontuário salvo com sucesso!')
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      toast.error('Erro ao salvar prontuário')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-4 mb-4">
        {[
          { id: 'anamnesis', label: 'Anamnese' },
          { id: 'diagnosis', label: 'Diagnóstico' },
          { id: 'treatment', label: 'Conduta/Tratamento' },
          { id: 'notes', label: 'Anotações Livres' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeSection === tab.id 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {activeSection === 'anamnesis' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Queixa Principal (QP)
              </label>
              <textarea
                value={formData.anamnesis?.mainComplaint}
                onChange={(e) => handleContentChange('anamnesis', 'mainComplaint', e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Descreva a queixa principal do paciente..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                História da Doença Atual (HDA)
              </label>
              <textarea
                value={formData.anamnesis?.history}
                onChange={(e) => handleContentChange('anamnesis', 'history', e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Descreva a história clínica..."
              />
            </div>
          </div>
        )}

        {activeSection === 'diagnosis' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hipótese Diagnóstica
              </label>
              <textarea
                value={formData.diagnosis?.hypothesis}
                onChange={(e) => handleContentChange('diagnosis', 'hypothesis', e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Descreva as hipóteses diagnósticas..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CID (Código Internacional de Doenças)
              </label>
              <input
                type="text"
                value={formData.diagnosis?.cid}
                onChange={(e) => handleContentChange('diagnosis', 'cid', e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: F32.9"
              />
            </div>
          </div>
        )}

        {activeSection === 'treatment' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Conduta / Plano Terapêutico
              </label>
              <textarea
                value={formData.treatment?.conduct}
                onChange={(e) => handleContentChange('treatment', 'conduct', e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="Descreva a conduta adotada..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prescrição / Encaminhamentos
              </label>
              <textarea
                value={formData.treatment?.prescription}
                onChange={(e) => handleContentChange('treatment', 'prescription', e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Medicamentos, exames ou encaminhamentos..."
              />
            </div>
          </div>
        )}

        {activeSection === 'notes' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Anotações Livres
              </label>
              <textarea
                value={freeNotes}
                onChange={(e) => setFreeNotes(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 bg-yellow-50 dark:bg-yellow-900/10"
                rows={10}
                placeholder="Espaço livre para anotações gerais..."
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Salvar Prontuário
        </button>
      </div>
    </form>
  )
}
