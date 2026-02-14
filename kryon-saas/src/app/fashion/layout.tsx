import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/ThemeContext'
import FashionClientLayout from './FashionClientLayout'

export const metadata: Metadata = {
  title: 'Fashion Store AI | Dashboard',
  description: 'Sistema de gestão para lojas de roupas com Inteligência Artificial.',
}

export default async function FashionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch Shop Data
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!shop || shop.store_type !== 'fashion_store_ai') {
      redirect('/products') 
  }

  return (
    <ThemeProvider>
        <FashionClientLayout shop={shop} user={user}>
            {children}
        </FashionClientLayout>
        <Toaster position="top-right" richColors />
    </ThemeProvider>
  )
}
