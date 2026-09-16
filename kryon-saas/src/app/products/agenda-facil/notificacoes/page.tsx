import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import NotificationsClient from './NotificationsClient';

export const dynamic = 'force-dynamic';

export default async function NotificacoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Get User Profile & Organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.organization_id) {
    redirect('/select-organization');
  }

  const organization = profile.organizations;
  const orgId = profile.organization_id;

  // 2. Fetch Notification Logs for Organization
  let logs: any[] = [];
  try {
    const { data: fetchedLogs, error } = await supabase
      .from('agenda_notification_logs')
      .select(`
        id,
        organization_id,
        appointment_id,
        recipient_type,
        recipient_name,
        recipient_contact,
        channel,
        notification_type,
        status,
        scheduled_for,
        sent_at,
        provider_message_id,
        error_message,
        metadata,
        created_at
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(150);

    if (!error && fetchedLogs) {
      logs = fetchedLogs;
    }
  } catch (err) {
    console.error('Error fetching notification logs:', err);
    logs = [];
  }

  return (
    <NotificationsClient 
      initialLogs={logs} 
      profile={profile} 
      organization={organization} 
    />
  );
}
