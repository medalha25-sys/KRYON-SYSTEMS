'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Save, Check } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface SettingsViewProps {
  organization: {
    id: string
    name: string
    logo_url?: string
    white_label_enabled?: boolean
  }
}

export function SettingsView({ organization }: SettingsViewProps) {
  const [logoUrl, setLogoUrl] = useState(organization.logo_url || '')
  const [whiteLabel, setWhiteLabel] = useState(organization.white_label_enabled || false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setLoading(true)
    
    // Upload logic (Mocked for now as we need bucket setup)
    // Real flow: supabase.storage.from('logos').upload(...)
    // Just simulating a URL change for demonstration
    // Assuming bucket 'organization-logos' exists
    const fileExt = file.name.split('.').pop()
    const filePath = `${organization.id}/logo.${fileExt}`
    
    // const { error: uploadError } = await supabase.storage.from('organization-logos').upload(filePath, file, { upsert: true })
    
    // For this demo, let's pretend we uploaded and got a simplified fake URL or just use a placeholder if upload fails/no bucket
    // In a real scenario, I'd ensure the bucket exists.
    
    // Use a blob URL for immediate feedback
    const objectUrl = URL.createObjectURL(file)
    setLogoUrl(objectUrl) 
    
    setLoading(false)
  }

  const handleSave = async () => {
    setLoading(true)
    // Update organization
    const { error } = await supabase
        .from('organizations')
        .update({ 
            logo_url: logoUrl, // In real app, this would be the Storage URL
            white_label_enabled: whiteLabel 
        })
        .eq('id', organization.id)
        
    if (!error) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações da Clínica</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         {/* Logo Section */}
         <div className="p-6 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 mb-4">Marca e Personalização (White-Label)</h3>
            
            <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200 overflow-hidden relative">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                        <span className="text-gray-400 text-xs text-center">Sem Logo</span>
                    )}
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>
                
                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-3">
                        Faça upload do logotipo da sua clínica. Recomendado: PNG transparente, 200x200px.
                    </p>
                    <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        <Upload size={16} />
                        Escolher Arquivo
                    </button>
                </div>
            </div>
         </div>

         {/* White Label Toggle */}
         <div className="p-6 bg-gray-50/50">
             <div className="flex items-center justify-between">
                 <div>
                     <h4 className="font-medium text-gray-900">Remover "Powered by Clínica Serena"</h4>
                     <p className="text-sm text-gray-500 mt-1">Disponível apenas no plano Enterprise.</p>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={whiteLabel} 
                        onChange={(e) => setWhiteLabel(e.target.checked)}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
             </div>
         </div>

         {/* Footer Actions */}
         <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
             <button 
                onClick={handleSave}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white transition ${
                    success ? 'bg-green-600' : 'bg-gray-900 hover:bg-gray-800'
                }`}
             >
                 {loading ? 'Salvando...' : success ? <><Check size={18} /> Salvo!</> : <><Save size={18} /> Salvar Alterações</>}
             </button>
         </div>
      </div>
    </div>
  )
}
