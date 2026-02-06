'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Erro na autenticação: ' + error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const shop_id = formData.get('shop_id') as string
  const role = formData.get('role') as string

  const { data: { session }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        shop_id: shop_id || null,
        role: role || 'admin'
      }
    }
  })

  if (error) {
    redirect('/login?message=Erro ao cadastrar: ' + error.message)
  }

  if (session) {
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Cadastro realizado! Verifique seu e-mail para ativar seu acesso e entrar no sistema.')
}
