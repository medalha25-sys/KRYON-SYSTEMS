import { ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // const adminEmail = process.env.ADMIN_EMAIL
  // if (user.email !== adminEmail) {
  //   redirect('/') // Redirect unauthorized users to home
  // }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <AdminSidebar userEmail={user.email} />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
