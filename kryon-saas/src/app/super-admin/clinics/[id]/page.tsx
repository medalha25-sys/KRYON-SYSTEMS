import { createClient } from '@/utils/supabase/server'
import { updateOrganization } from '../../actions'
import { startImpersonation } from '../../actions'

export default async function ClinicDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  // Next 15: params is async
const {
    id
  } = params;
  
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select(`
        *,
        organization_members (
            user_id,
            role,
            profiles ( email, name )
        ),
        subscriptions (*)
    `)
    .eq('id', id)
    .single()

  if (!org) return <div>Organização não encontrada</div>

  const owner = org.organization_members.find((m: any) => m.role === 'owner')?.profiles

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold">{org.name}</h1>
            <p className="text-slate-400 font-mono text-sm">{org.id}</p>
        </div>
        <div className="space-x-4">
             <form action={async () => {
                'use server'
                await startImpersonation(org.organization_members.find((m: any) => m.role === 'owner')?.user_id, 'Admin Access from Details')
            }} className="inline-block">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
                    Acessar como Dono
                </button>
            </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info Card */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
            <h3 className="font-semibold text-lg border-b border-slate-700 pb-2">Detalhes</h3>
            <div>
                <label className="block text-xs text-slate-500 uppercase">Slug</label>
                <div className="font-mono">{org.slug}</div>
            </div>
            <div>
                <label className="block text-xs text-slate-500 uppercase">Dono</label>
                <div>{owner?.name} ({owner?.email})</div>
            </div>
             <div>
                <label className="block text-xs text-slate-500 uppercase">Assinatura Atual</label>
                <div className="text-green-400">
                    {org.subscriptions?.[0]?.status || 'Sem assinatura'} 
                    {org.subscriptions?.[0]?.product_slug && ` (${org.subscriptions[0].product_slug})`}
                </div>
            </div>
        </div>

        {/* Control Card */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
            <h3 className="font-semibold text-lg border-b border-slate-700 pb-2 text-orange-400">Controle Manual (Super Admin)</h3>
            <form action={async (formData) => {
                'use server'
                const status = formData.get('status') as string
                const plan = formData.get('plan') as string
                const notes = formData.get('notes') as string
                
                await updateOrganization(org.id, {
                    manual_status: status,
                    manual_plan_override: plan,
                    admin_notes: notes
                })
            }} className="space-y-4">
                
                <div>
                    <label className="block text-sm mb-1">Status da Conta</label>
                    <select name="status" defaultValue={org.manual_status || 'active'} className="w-full bg-slate-900 border border-slate-600 rounded p-2">
                        <option value="active">Ativo</option>
                        <option value="suspended">Suspenso (Bloqueado)</option>
                        <option value="archived">Arquivado</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm mb-1">Plano Forçado (Override)</label>
                    <select name="plan" defaultValue={org.manual_plan_override || ''} className="w-full bg-slate-900 border border-slate-600 rounded p-2">
                        <option value="">-- Nenhum (Usar Assinatura) --</option>
                        <option value="enterprise">Enterprise (Ilimitado)</option>
                        <option value="basic">Basic (Restrito)</option>
                        <option value="trial">Trial (15 dias)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Isso ignorará a assinatura do Mercado Pago.</p>
                </div>

                <div>
                    <label className="block text-sm mb-1">Notas Internas</label>
                    <textarea name="notes" defaultValue={org.admin_notes || ''} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm" rows={3}></textarea>
                </div>

                <button className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 rounded font-medium">
                    Salvar Alterações
                </button>
            </form>
        </div>
      </div>
    </div>
  )
}
