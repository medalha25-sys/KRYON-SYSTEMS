import type { Metadata } from 'next'
import Hero from './components/Hero'

export const metadata: Metadata = {
  title: 'Agenda Fácil | Sistema de Agendamento para Psicólogos',
  description: 'Sistema completo de agendamento online, prontuário digital e controle financeiro para psicólogos.',
}

export default function AgendaFacilPage() {
  return (
    <main className="bg-white text-gray-800 min-h-screen">
      <Hero />
    </main>
  )
}
