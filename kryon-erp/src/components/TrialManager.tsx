'use client'

import React, { useState } from 'react'
import PremiumNoticeBanner from '@/components/PremiumNoticeBanner'
import UpgradeModal from '@/components/UpgradeModal'
import { AccessStatus } from '@/lib/checkAccess'

interface TrialManagerProps {
  status: AccessStatus
  daysLeft: number
  children: React.ReactNode
}

export default function TrialManager({ status, daysLeft, children }: TrialManagerProps) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col h-full w-full">
        {/* Banner at the top of content */}
        <div className="px-6 pt-6">
            <PremiumNoticeBanner 
                status={status} 
                daysLeft={daysLeft} 
                onUpgrade={() => setIsUpgradeModalOpen(true)} 
            />
        </div>
        
        {children}
      </div>

      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />
    </>
  )
}
