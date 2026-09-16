import { createClient } from '@/utils/supabase/server';
import { sendEmail } from '@/lib/email';
import { AppointmentNotificationData, NotificationChannel, NotificationType } from './types';
import { generateEmailTemplate } from './email-templates';

export interface SendNotificationOptions {
  channel?: NotificationChannel;
}

/**
 * Gera chave de idempotência determinística para prevenir disparos duplicados sob concorrência.
 * - Eventos únicos: appointmentId:type:channel
 * - Remarcações: appointmentId:booking_rescheduled:channel:prevTime_to_newTime
 */
export function generateIdempotencyKey(
  type: NotificationType,
  channel: NotificationChannel,
  data: AppointmentNotificationData
): string {
  const apptId = data.appointmentId || 'no_appt';

  if (type === 'booking_rescheduled') {
    const prevTime = data.previousStartTime
      ? new Date(data.previousStartTime).toISOString()
      : 'initial';
    const newTime = data.startTime
      ? new Date(data.startTime).toISOString()
      : 'unknown';
    return `${apptId}:booking_rescheduled:${channel}:${prevTime}_to_${newTime}`;
  }

  // Eventos unívocos: booking_created, booking_confirmed, reminder_24h, reminder_2h, booking_canceled
  return `${apptId}:${type}:${channel}`;
}

/**
 * Despachante atômico de notificações do Kryon Agenda.
 * Ordem operacional: INSERT (pending) -> Se 23505 (skipped) -> SEND (Resend) -> UPDATE (sent/failed)
 * 
 * NOTA DE RESILIÊNCIA:
 * Em caso de crash do processo entre o INSERT e o SEND, o registro permanecerá como 'pending'.
 * A recuperação de pending e retries automáticos serão tratados em fase posterior de mensageria.
 */
export async function sendAppointmentNotification(
  type: NotificationType,
  data: AppointmentNotificationData,
  options: SendNotificationOptions = {}
): Promise<{ success: boolean; skipped?: boolean; error?: string; logId?: string }> {
  const channel: NotificationChannel = options.channel || 'email';
  const supabase = await createClient();

  try {
    // 1. Tratamento do Canal WhatsApp (Preparado para futura integração oficial)
    if (channel === 'whatsapp') {
      console.log(`[NOTIFICATIONS] WhatsApp notification for ${data.appointmentId} (${type}) queued/skipped (Provider not configured).`);
      return {
        success: true,
        skipped: true,
        error: 'Canal WhatsApp preparado para integração futura com provedor oficial.'
      };
    }

    // 2. Validação de Destinatário de E-mail
    const recipientEmail = data.clientEmail?.trim();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.log(`[NOTIFICATIONS] No valid email for appointment ${data.appointmentId}. Skipping.`);
      return {
        success: true,
        skipped: true,
        error: 'Nenhum e-mail válido fornecido para o destinatário.'
      };
    }

    // 3. Geração da Chave de Idempotência Determinística
    const idempotencyKey = generateIdempotencyKey(type, channel, data);
    let reservationLogId: string | null = null;
    let isReserved = false;

    // 4. Reserva Atômica no Banco de Dados (INSERT pending)
    try {
      const logPayload = {
        organization_id: data.organizationId,
        appointment_id: data.appointmentId || null,
        recipient_type: 'client' as const,
        recipient_name: data.clientName || 'Paciente',
        recipient_contact: recipientEmail,
        channel: 'email',
        notification_type: type,
        idempotency_key: idempotencyKey,
        status: 'pending' as const,
        metadata: {
          service: data.serviceName,
          professional: data.professionalName,
          startTime: data.startTime,
          previousStartTime: data.previousStartTime || null
        }
      };

      const { data: insertedLog, error: insertError } = await supabase
        .from('agenda_notification_logs')
        .insert(logPayload)
        .select('id')
        .maybeSingle();

      if (insertError) {
        // Detecção explícita de violação de chave única (PostgreSQL 23505)
        const isDuplicateKey =
          insertError.code === '23505' ||
          insertError.message?.includes('23505') ||
          insertError.message?.includes('duplicate key') ||
          insertError.message?.includes('unique constraint') ||
          insertError.details?.includes('already exists');

        if (isDuplicateKey) {
          console.log(`[NOTIFICATIONS] Idempotency lock active: Notification ${type} (${idempotencyKey}) already reserved/sent. Skipping dispatch.`);
          return { success: true, skipped: true };
        }

        // Tabela ainda não existente em ambiente local/pre-migration ou outro aviso não-bloqueante
        console.warn('[NOTIFICATIONS] Atomic reservation warning (table may not exist yet):', insertError.message || insertError.code);
      } else if (insertedLog) {
        reservationLogId = insertedLog.id;
        isReserved = true;
      }
    } catch (reserveErr: any) {
      const isDuplicateKey =
        reserveErr?.code === '23505' ||
        reserveErr?.message?.includes('23505') ||
        reserveErr?.message?.includes('duplicate key');

      if (isDuplicateKey) {
        console.log(`[NOTIFICATIONS] Idempotency catch: Key ${idempotencyKey} duplicate. Skipping dispatch.`);
        return { success: true, skipped: true };
      }
      console.warn('[NOTIFICATIONS] Non-blocking reservation catch error:', reserveErr);
    }

    // 5. Geração de Conteúdo do Template (pt-BR)
    const { subject, html } = generateEmailTemplate(type, data);

    // 6. Envio pelo Provedor Externo (Resend)
    const sendResult = await sendEmail({
      to: recipientEmail,
      subject,
      html
    });

    const isSuccess = sendResult.success && !(sendResult as any).error;
    const providerMessageId = (sendResult as any)?.data?.id || (sendResult as any)?.id || null;
    const errorMessage = !isSuccess ? ((sendResult as any).error?.message || 'Erro no envio') : null;

    // 7. Atualização do Registro Reservado (UPDATE para sent ou failed)
    try {
      const updatePayload = {
        status: isSuccess ? ('sent' as const) : ('failed' as const),
        sent_at: isSuccess ? new Date().toISOString() : null,
        provider_message_id: providerMessageId,
        error_message: errorMessage
      };

      if (isReserved && reservationLogId) {
        await supabase
          .from('agenda_notification_logs')
          .update(updatePayload)
          .eq('id', reservationLogId);
      } else {
        await supabase
          .from('agenda_notification_logs')
          .update(updatePayload)
          .eq('idempotency_key', idempotencyKey);
      }
    } catch (updateErr) {
      console.warn('[NOTIFICATIONS] Could not update notification status:', updateErr);
    }

    return {
      success: isSuccess,
      error: errorMessage || undefined,
      logId: reservationLogId || undefined
    };

  } catch (err: any) {
    console.error(`[NOTIFICATIONS ERROR] Failed to dispatch notification ${type}:`, err);
    return { success: false, error: err.message || 'Erro inesperado no envio da notificação' };
  }
}
