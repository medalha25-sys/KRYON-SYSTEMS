'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Building2, 
  Car, 
  Save, 
  Upload, 
  Clock, 
  DollarSign 
} from 'lucide-react'

export default function LavaRapidoSettings() {
  const [activeTab, setActiveTab] = useState<'empresa' | 'servicos'>('empresa')
  
  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold mb-1">Configurações</h1>
        <p className="text-gray-400">Gerencie a identidade da empresa e os parâmetros do sistema.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800">
        <button 
          onClick={() => setActiveTab('empresa')}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === 'empresa' ? 'text-blue-400' : 'text-gray-500 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Empresa
          </div>
          {activeTab === 'empresa' && (
            <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('servicos')}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === 'servicos' ? 'text-blue-400' : 'text-gray-500 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            Tabela de Preços & Tempo
          </div>
          {activeTab === 'servicos' && (
            <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
      </div>

      <div className="max-w-4xl">
        {activeTab === 'empresa' ? <BrandingForm /> : <ServicesForm />}
      </div>
    </div>
  )
}

function BrandingForm() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Identidade Visual
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nome da Unidade / Empresa</label>
                <input 
                  type="text" 
                  defaultValue="Papa Léguas Lava Rápido"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Ex: Lava Rápido do João"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">URL do Logotipo</label>
                <div className="flex gap-2">
                   <input 
                    type="text" 
                    defaultValue="/branding/logo_character.png"
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                    placeholder="https://sua-logo.png"
                  />
                  <button className="bg-gray-800 p-3 rounded-xl hover:bg-gray-700 transition" title="Upload">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 italic">Recomendado: fundo transparente (PNG), formato quadrado ou horizontal.</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl p-6 bg-gray-950/50">
               <div className="relative w-24 h-24 mb-4">
                  <img src="/branding/logo_character.png" alt="Preview" className="w-full h-full object-contain" />
               </div>
               <p className="text-sm font-medium text-gray-400">Prévia do Logo</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 flex justify-end">
          <button 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ServicesForm() {
  const [loading, setLoading] = useState(false)
  
  const services = [
    { id: 1, name: 'Lavagem Completa', duration: 60, price_p: 50, price_m: 70, price_g: 90 },
    { id: 2, name: 'Higienização Interna', duration: 240, price_p: 250, price_m: 300, price_g: 350 },
    { id: 3, name: 'Polimento Técnico', duration: 480, price_p: 400, price_m: 500, price_g: 650 },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Valores e Tempos
          </h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Valores em Reais (R$)</p>
        </div>

        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="bg-gray-950 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">{service.name}</h4>
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tempo estimado: {service.duration} min</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 w-full md:w-auto">
                   <ServiceInput label="P" value={service.price_p} />
                   <ServiceInput label="M" value={service.price_m} />
                   <ServiceInput label="G" value={service.price_g} />
                   <ServiceInput label="⏱ Min" value={service.duration} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex justify-end">
          <button 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Atualizando Tabela...' : 'Atualizar Tabela'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ServiceInput({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] uppercase font-bold text-gray-500 text-center">{label}</label>
      <input 
        type="number" 
        defaultValue={value}
        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2 py-2 text-center text-sm font-bold text-blue-400 focus:outline-none focus:border-blue-500 transition"
      />
    </div>
  )
}
