-- Add public_booking_enabled to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS public_booking_enabled BOOLEAN DEFAULT false;

-- Add public_booking_enabled to agenda_professionals
ALTER TABLE agenda_professionals ADD COLUMN IF NOT EXISTS public_booking_enabled BOOLEAN DEFAULT true;

-- Update agenda_appointments status check to include 'requested'
ALTER TABLE agenda_appointments DROP CONSTRAINT IF EXISTS agenda_appointments_status_check;

ALTER TABLE agenda_appointments ADD CONSTRAINT agenda_appointments_status_check 
CHECK (status IN ('scheduled', 'confirmed', 'completed', 'canceled', 'no_show', 'blocked', 'requested'));
