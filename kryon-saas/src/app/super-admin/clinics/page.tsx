import { createClient } from '@/utils/supabase/server'
import { startImpersonation } from '../actions'
import Link from 'next/link'

export default async function ClinicsPage() {
  const supabase = await createClient()

  // Fetch all organizations with their owners
  // We need to join organization_members to find the owner
  const { data: orgs } = await supabase
    .from('organizations')
    .select(`
        *,
        organization_members!inner (
            user_id,
            role,
            profiles ( email, name )
        )
    `)
    .eq('organization_members.role', 'owner') // Only get owners context
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciar Clínicas</h1>
        <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-sm">
            Nova Clínica
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-700 text-slate-300 uppercase font-medium">
                <tr>
                    <th className="px-6 py-3">Organização</th>
                    <th className="px-6 py-3">Dono (Email)</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {orgs?.map((org: any) => {
                    const owner = org.organization_members[0]?.profiles
                    // Using a form for server action
                    return (
                        <tr key={org.id} className="hover:bg-slate-700/50">
                            <td className="px-6 py-4 font-medium">
                                <Link href={`/super-admin/clinics/${org.id}`} className="hover:text-blue-400 hover:underline">
                                    {org.name}
                                </Link>
                                <br/>
                                <span className="text-xs text-slate-500">{org.slug}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                                {owner?.name || 'N/A'}
                                <br/>
                                <span className="text-xs text-slate-500">{owner?.email}</span>
                            </td>
                             <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs ${org.manual_status === 'suspended' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                    {org.manual_status || 'Active'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <form action={async () => {
                                    'use server'
                                    await startImpersonation(org.organization_members[0].user_id, 'Admin Request')
                                }}>
                                    <button type="submit" className="text-blue-400 hover:text-blue-300 hover:underline">
                                        Login as Owner
                                    </button>
                                </form>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
      </div>
    </div>
  )
}
