'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signUpForTrial(formData: FormData) {
  const companyName = formData.get('companyName') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const productSlug = formData.get('product') as string
  const headersList = await headers()
  const origin = headersList.get('origin')

  if (!email || !password || !productSlug || !companyName || !name) {
    return { error: 'Todos os campos são obrigatórios' }
  }

  const supabase = await createClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINED' : 'MISSING'
  
  console.log(`SignUp attempt: ${email} for product [${productSlug}] on DB: ${supabaseUrl}`)

  // 1. Validate Product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name')
    .eq('slug', productSlug)
    .single()

  if (productError) {
      console.error('Product fetch error:', productError)
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true })
      console.error(`Product fetch error: [${productSlug}] not found. Total: ${count}. URL: ${supabaseUrl}`)
      return { 
          error: `Erro: Produto [${productSlug}] não encontrado no sistema. Contate o suporte.`
      }
  }

  if (!product) {
      console.error(`Product [${productSlug}] retornado vazio no BD: ${supabaseUrl}`)
      return { error: `Produto [${productSlug}] inválido ou não encontrado.` }
  }

  // 2. Sign Up
  // Determine redirect URL: prioritize fixed site URL, then origin header
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin || 'https://kryon-saas.vercel.app'
  const redirectUrl = `${siteUrl}/auth/callback?next=/login?confirmed=1`
  
  console.log(`Calling supabase.auth.signUp with redirect: ${redirectUrl}`)
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
          owner_name: name,
          company_name: companyName,
          product_slug: productSlug
      }
    },
  })

  if (authError) {
    console.error('Auth Error:', authError.message)
    if (authError.message === 'User already registered') {
        return { error: 'Este e-mail já está cadastrado. Tente fazer login.' }
    }
    return { error: 'Erro ao criar conta. Por favor, tente novamente.' }
  }

  if (!authData.user) {
    console.error('No user returned after signUp')
    return { error: 'Erro inesperado ao criar usuário. Tente novamente.' }
  }

  console.log(`User created: ${authData.user.id}. Waiting for email confirmation.`)

  // 7. Return success (Frontend will handle the notification card)
  return { success: true }
}

export async function getProductDetails(slug: string) {
    const supabase = await createClient()
    const { data } = await supabase.from('products').select('name, description').eq('slug', slug).single()
    return data
}
