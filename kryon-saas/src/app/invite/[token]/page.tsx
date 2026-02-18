'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  // Unwrap params using React.use()
  const { token } = use(params)
  
  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkInvite() {
      // Call the RPC function or check via server action (recommended)
      // Since we defined RPC get_invite_by_token:
      const { data, error } = await supabase.rpc('get_invite_by_token', { lookup_token: token })
      
      if (error || !data || data.length === 0 || !data[0].is_valid) {
        setError('Convite inválido ou expirado.')
      } else {
        setInvite(data[0])
      }
      setLoading(false)
    }
    checkInvite()
  }, [token, supabase])

  const handleAccept = async () => {
    // Redirect to Signup/Login with token to process after auth
    // We store token in cookie or pass as query param?
    // Safer: Redirect to /signup?invite_token=...
    router.push(`/signup?invite_token=${token}&email=${encodeURIComponent(invite.email)}`)
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="text-red-600" size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Ops! Algo deu errado</h1>
            <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
       >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-emerald-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Convite para {invite.organization_name}</h1>
          <p className="text-gray-600 mb-8">
            Você foi convidado(a) para atuar como <strong>{invite.role}</strong>.
            <br/>
            <span className="text-xs text-gray-400">{invite.email}</span>
          </p>

          <button 
            onClick={handleAccept}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Aceitar e Criar Conta via Agenda Fácil
          </button>
       </motion.div>
    </div>
  )
}
