export type NotificationChannel = 'email' | 'whatsapp';

export type NotificationType = 
  | 'booking_created'
  | 'booking_confirmed'
  | 'reminder_24h'
  | 'reminder_2h'
  | 'booking_canceled'
  | 'booking_rescheduled';

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export type RecipientType = 'client' | 'professional' | 'organization';

export interface NotificationLog {
  id: string;
  organization_id: string;
  appointment_id?: string | null;
  recipient_type: RecipientType;
  recipient_id?: string | null;
  recipient_name?: string | null;
  recipient_contact: string;
  channel: NotificationChannel;
  notification_type: NotificationType;
  idempotency_key?: string | null;
  status: NotificationStatus;
  scheduled_for?: string | null;
  sent_at?: string | null;
  provider_message_id?: string | null;
  error_message?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AppointmentNotificationData {
  appointmentId: string;
  organizationId: string;
  organizationName: string;
  organizationLogo?: string | null;
  organizationAddress?: string | null;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  professionalName: string;
  serviceName: string;
  servicePrice?: number | null;
  startTime: string | Date;
  endTime?: string | Date | null;
  notes?: string | null;
  cancellationReason?: string | null;
  previousStartTime?: string | Date | null;
}
