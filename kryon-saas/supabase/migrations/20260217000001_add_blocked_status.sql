ALTER TABLE agenda_appointments DROP CONSTRAINT agenda_appointments_status_check;

ALTER TABLE agenda_appointments ADD CONSTRAINT agenda_appointments_status_check 
CHECK (status IN ('scheduled', 'confirmed', 'completed', 'canceled', 'no_show', 'blocked'));
