-- Migration: 20260217000010_agenda_notifications.sql
-- Description: Criação da tabela de logs e idempotência de notificações para o Kryon Agenda (Modelo de Reserva Atômica com idempotency_key)

CREATE TABLE IF NOT EXISTS agenda_notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES agenda_appointments(id) ON DELETE CASCADE,
    recipient_type TEXT NOT NULL DEFAULT 'client' CHECK (recipient_type IN ('client', 'professional', 'organization')),
    recipient_id UUID,
    recipient_name TEXT,
    recipient_contact TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'whatsapp')),
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'booking_created',
        'booking_confirmed',
        'reminder_24h',
        'reminder_2h',
        'booking_canceled',
        'booking_rescheduled'
    )),
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    provider_message_id TEXT,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de Alta Performance
CREATE INDEX IF NOT EXISTS idx_agenda_notif_org_id ON agenda_notification_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_agenda_notif_appt ON agenda_notification_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_agenda_notif_status_sched ON agenda_notification_logs(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_agenda_notif_created_at ON agenda_notification_logs(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE agenda_notification_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Multi-tenant (SELECT, INSERT, UPDATE)
CREATE POLICY "Usuários podem visualizar notificações de sua organização"
ON agenda_notification_logs FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Usuários podem inserir notificações para sua organização"
ON agenda_notification_logs FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Usuários podem atualizar notificações para sua organização"
ON agenda_notification_logs FOR UPDATE
USING (
    organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
);
