-- 20240603000000_agenda_colors.sql

-- Add color column to agenda_professionals
ALTER TABLE agenda_professionals ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';

-- Update existing professionals with random colors to differentiate them (Optional, but good for demo)
-- We can't easily do random distinct colors in SQL without complex logic, so we just set default.
-- Users can update them via UI later (we might need to add color picker to ProfessionalForm).

-- Ensure the column is visible/editable via RLS (already covered by "Org manage professionals" policy)
