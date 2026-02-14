import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeProvider } from '@/components/ThemeContext'
import { CashRegisterProvider } from '@/components/CashRegisterContext'
import ERPLayout from '@/components/ERPLayout'
import './dashboard.css'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <ThemeProvider>
      <CashRegisterProvider>
        <ERPLayout userEmail={user.email}>
          {children}
        </ERPLayout>
      </CashRegisterProvider>
    </ThemeProvider>
  )
}
