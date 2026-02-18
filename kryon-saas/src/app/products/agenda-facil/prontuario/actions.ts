'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type ClinicalRecordContent = {
  anamnesis?: {
    mainComplaint?: string;
    history?: string;
  };
  diagnosis?: {
    hypothesis?: string;
    cid?: string;
  };
  treatment?: {
    conduct?: string;
    prescription?: string;
  };
}

export async function createClinicalRecord(data: {
  appointment_id?: string;
  client_id: string;
  professional_id?: string;
  content: ClinicalRecordContent;
  free_notes?: string;
}) {
  const supabase = await createClient()

  // Get current user's organization
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) return { error: 'Organização não encontrada' }

  const { error } = await supabase.from('clinical_records').insert({
    organization_id: profile.organization_id,
    client_id: data.client_id,
    appointment_id: data.appointment_id,
    professional_id: data.professional_id, // Should ideally come from the logged in user's professional profile if applicable
    content: data.content,
    free_notes: data.free_notes,
  })

  if (error) {
    console.error('Error creating clinical record:', error)
    return { error: 'Falha ao criar prontuário' }
  }

  revalidatePath('/products/agenda-facil/clientes')
  return { success: true }
}

export async function getClinicalRecordsByClient(clientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clinical_records')
    .select(`
      *,
      agenda_appointments (
        start_time,
        agenda_services (name)
      ),
      agenda_professionals (name)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clinical records:', error)
    return []
  }

  return data
}
