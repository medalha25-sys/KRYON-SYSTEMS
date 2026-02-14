'use client'

import React from 'react'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import PainPoints from '@/components/landing/PainPoints'
import Solutions from '@/components/landing/Solutions'
import Features from '@/components/landing/Features'
import CreativeCalendar from '@/components/landing/CreativeCalendar'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'
import FAQ from '@/components/landing/FAQ'
import Contact from '@/components/landing/Contact'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-blue-500 selection:text-white font-sans">
      <Navbar />
      
      <main>
        <Hero />
        <PainPoints />
        <Solutions />
        <Features />
        <CreativeCalendar />
        <Pricing />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>

      <Footer />
    </div>
  )
}


