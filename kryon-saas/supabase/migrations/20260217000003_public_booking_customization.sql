-- Add customization fields to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3b82f6';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1d4ed8';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS welcome_message TEXT DEFAULT 'Agende seu horário online';
