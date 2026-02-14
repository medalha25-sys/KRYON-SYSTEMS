'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface BirthdayModalProps {
  userName: string
  onClose: () => void
}

export default function BirthdayModal({ userName, onClose }: BirthdayModalProps) {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    // Trigger confetti
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(onClose, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#1e2730] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Top Gradient Bar */}
            <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
            
            <div className="p-8 text-center">
              {/* Icon Container */}
              <div className="mb-6 relative inline-block">
                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-4xl text-yellow-500 fill-1">cake</span>
                </div>
                <div className="absolute -top-1 -right-1 text-2xl animate-bounce">🎉</div>
              </div>

              <h2 className="text-3xl font-black text-white mb-2">
                Feliz Aniversário, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{userName}</span>! 🥳
              </h2>
              
              <p className="text-gray-300 text-lg font-medium mb-8">
                Hoje o dia é todo seu!
              </p>

              {/* Quote Box */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-8 italic relative">
                <span className="absolute -top-3 left-6 text-4xl text-gray-700 font-serif">"</span>
                <p className="text-gray-400 text-base leading-relaxed">
                  O sucesso é a soma de pequenos esforços repetidos dia após dia.
                </p>
                <p className="text-gray-500 text-sm mt-4 not-italic font-medium">
                  Agradecemos imensamente por você fazer parte da nossa equipe de colaboradores. Sua dedicação e talento fazem toda a diferença para nós!
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleClose}
                className="w-full py-4 bg-gradient-to-r from-green-400 to-purple-600 hover:from-green-500 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-lg transform active:scale-95 transition-all duration-200"
              >
                Obrigado! Vamos trabalhar!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
