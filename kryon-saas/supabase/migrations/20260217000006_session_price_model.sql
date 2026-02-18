-- Add default session price to professionals
ALTER TABLE public.agenda_professionals 
ADD COLUMN default_session_price DECIMAL(10,2) DEFAULT 0;

-- Add session price to appointments (snapshot at time of booking)
ALTER TABLE public.agenda_appointments 
ADD COLUMN session_price DECIMAL(10,2);

-- Comment to explain the model
COMMENT ON COLUMN public.agenda_appointments.session_price IS 'The agreed price for this specific session, defaulting to the professional''s standard rate but editable.';
