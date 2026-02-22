'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, ArrowRight, Plus } from 'lucide-react'

type Organization = {
  id: string
  name: string
  role: string
  logo_url?: string
}

export default function SelectOrganizationPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchOrgs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch organizations where the user is a member
      const { data: members, error } = await supabase
        .from('organization_members')
        .select(`
            organization_id,
            role,
            organizations (
                id, name, logo_url
            )
        `)
        .eq('user_id', user.id)

      if (error) {
          console.error('Error fetching organizations:', error)
          setOrganizations([]) // Clear orgs
          setErrorMsg(JSON.stringify(error, null, 2))
          setLoading(false)
          return
      }

      if (members && members.length > 0) {
          const orgs = members.map(m => {
              // @ts-ignore
              const orgData = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations
              return {
                  id: orgData?.id,
                  name: orgData?.name,
                  logo_url: orgData?.logo_url,
                  role: m.role
              }
          }) as Organization[]
          setOrganizations(orgs)
      } else {
          setOrganizations([])
      }
      setLoading(false)
    }

    fetchOrgs()
  }, [router, supabase])

  const handleSelectOrganization = async (orgId: string) => {
      try {
          setUpdateLoading(true)
          setErrorMsg(null)
          
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
              router.push('/login')
              return
          }

          // Update the user's current Profile to point to this Organization
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ organization_id: orgId })
            .eq('id', user.id)

          if (updateError) {
              console.error("Failed to switch context", updateError)
              setErrorMsg(`Erro ao vincular empresa: ${updateError.message}`)
              setUpdateLoading(false)
              return
          }

          // 2. REFECTH PROFILE TO CHECK SUPER ADMIN
          const { data: profile, error: refetchError } = await supabase
            .from('profiles')
            .select('is_super_admin')
            .eq('id', user.id)
            .single()

          if (refetchError) {
              console.error("Failed to fetch profile", refetchError)
              // If we can't fetch is_super_admin, we might be blocked by RLS
              // Let's try to proceed to select-system anyway as a fallback
              router.push('/select-system')
              return
          }

          if (profile?.is_super_admin) {
              router.push('/super-admin')
              return
          }

          // Redirect to Product Selection
          router.push('/select-system')
      } catch (err: any) {
          console.error("Critical error in organization selection:", err)
          setErrorMsg(`Erro crítico: ${err.message || 'Erro desconhecido'}`)
          setUpdateLoading(false)
      }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center font-sans">
        <div className="max-w-2xl w-full">
            <header className="mb-12 text-center">
                <h1 className="text-3xl font-bold mb-4">Bem-vindo de volta</h1>
                <p className="text-gray-400">Selecione a clínica ou organização que deseja acessar.</p>
            </header>

            <div className="space-y-4">
                {organizations.map((org) => (
                    <motion.button
                        key={org.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectOrganization(org.id)}
                        disabled={updateLoading}
                        className="w-full bg-gray-900 border border-gray-800 hover:border-blue-500/50 p-6 rounded-2xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-900/20 group-hover:text-blue-400 transition-colors">
                                {org.logo_url ? (
                                    <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <Building2 size={24} />
                                )}
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{org.name}</h3>
                                <p className="text-sm text-gray-500 capitalize">{org.role}</p>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                    </motion.button>
                ))}

                {organizations.length === 0 && !errorMsg && (
                    <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800 border-dashed">
                        <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-300">Nenhuma organização encontrada</h3>
                        <p className="text-gray-500 text-sm mt-2">Você ainda não faz parte de nenhuma clínica.</p>
                    </div>
                )}

                {errorMsg && (
                    <div className="text-center py-12 bg-red-900/20 rounded-2xl border border-red-800/50 border-dashed p-4">
                        <h3 className="text-lg font-bold text-red-400">Erro ao carregar</h3>
                        <pre className="text-left text-xs text-red-300 mt-4 bg-black/50 p-4 rounded overflow-auto max-h-40">
                            {errorMsg}
                        </pre>
                    </div>
                )}

                <button className="w-full mt-4 py-4 rounded-xl border border-gray-800 border-dashed text-gray-500 hover:text-white hover:border-gray-600 transition-all flex items-center justify-center gap-2">
                    <Plus size={18} />
                    Criar ou entrar em outra organização
                </button>
            </div>
        </div>
    </div>
  )
}
