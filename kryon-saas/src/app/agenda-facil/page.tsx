'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import Hero from './components/Hero'
import Problem from './components/Problem'
import Benefits from './components/Benefits'
import Authority from './components/Authority'
import Testimonials from './components/Testimonials'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import PremiumModal from './components/PremiumModal'
import AccessRequestForm from './components/AccessRequestForm'

// Metadata cannot be exported from a 'use client' file.
// We must move metadata to layout or a separate file, or remove 'use client' from text file?
// But we need 'use client' for state.
// The user has 'use client' components inside.
// Actually, `page.tsx` was server component.
// I need to make `page.tsx` client component?
// Or better: Create a wrapper component for the content that needs state, OR
// make `Pricing` open the modal via a Context?
// Or simpler: Make `page.tsx` client side.
// But we lose metadata export.
// I will keep `page.tsx` as server component if possible... but I need state.
// I will separate the page content into `LandingPageContent.tsx` (client) or similarly.
// OR I will just remove `metadata` export for now and make it `use client`.
// The user provided instructions imply editing `page.jsx`.
// I will comment out metadata or move it?
// I'll make it `use client` and comment out metadata export if it errors, or just try.
// Next.js warns about metadata in client components.
// I'll assume I should make it client.

export default function AgendaFacilPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="bg-white text-gray-800 min-h-screen">
      <Hero />
      <Problem />
      <Benefits />
      <Authority />
      <Testimonials />
      <Pricing onOpenModal={() => setIsModalOpen(true)} />
      <FAQ />
      
      <PremiumModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AccessRequestForm />
      </PremiumModal>
    </main>
  )
}
