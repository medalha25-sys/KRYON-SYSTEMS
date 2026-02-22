-- Update the constraint to allow agenda_facil_ai and other future types
ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS check_store_type;

ALTER TABLE public.shops 
ADD CONSTRAINT check_store_type 
CHECK (store_type IN ('fashion_store_ai', 'mobile_store_ai', 'agenda_facil_ai', 'pet_store_ai', 'other'));

-- Re-run the fix script logic for Medalha Admin safely if needed, or just notify user to re-run the previous script.
-- But since the previous script failed mid-way, it's safer to re-run the whole fix administration script essentially.
-- I'll just provide the constraint fix first.
