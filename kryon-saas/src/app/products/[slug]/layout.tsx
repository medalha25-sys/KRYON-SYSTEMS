import { ReactNode } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProductProvider } from '@/components/shared/ProductContext'
import { CashRegisterProvider } from '@/components/CashRegisterContext'
import ERPLayout from '@/components/ERPLayout'

export default async function ProductLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Verify Product Access/Subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, product_slug')
    .eq('user_id', user.id)
    .eq('product_slug', slug)
    .single()

  if (!subscription || ['canceled', 'expired'].includes(subscription.status)) {
    redirect(`/assinar?product=${slug}`)
  }
  
  // 3. Fetch Product Details (Optional, for name display)
  // We can pass this to ERPLayout if needed in the future, 
  // currently ERPLayout fetches shop data itself or we can optimize later.

  return (
    <ProductProvider slug={slug}>
      <CashRegisterProvider>
        <ERPLayout userEmail={user.email}>
          {children}
        </ERPLayout>
      </CashRegisterProvider>
    </ProductProvider>
  )
}
