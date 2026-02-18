-- 20260217000000_agenda_security.sql

-- IMPLICIT REQUIREMENTS:
-- 1. 'profiles' table must have a 'role' column with values 'admin', 'secretary', 'professional'.
-- 2. 'agenda_professionals' table must have a 'user_id' column linked to auth.users.
-- 3. 'get_auth_organization_id()' function must exist (created in previous migrations).

-- ==============================================================================
-- 1. CLINICAL RECORDS SECURITY (Model C: Admin=All, Professional=Own, Secretary=None)
-- ==============================================================================

-- Enable RLS just in case
ALTER TABLE public.clinical_records ENABLE ROW LEVEL SECURITY;

-- Drop existing broad policies
DROP POLICY IF EXISTS "Org view clinical_records" ON public.clinical_records;
DROP POLICY IF EXISTS "Org manage clinical_records" ON public.clinical_records;

-- Policy: Admin can do EVERYTHING
CREATE POLICY "Admin manage all clinical_records" ON public.clinical_records
USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Professional can manage ONLY their own records
-- Matches records where 'professional_id' belongs to the current auth user
CREATE POLICY "Professional manage own clinical_records" ON public.clinical_records
USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    professional_id IN (
        SELECT id FROM public.agenda_professionals 
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    professional_id IN (
        SELECT id FROM public.agenda_professionals 
        WHERE user_id = auth.uid()
    )
);


-- Secretary: No policy created = Implicit Deny. Use strict RLS.


-- ==============================================================================
-- 2. APPOINTMENTS SECURITY (Model C: Admin=All, Secretary=All, Professional=Own)
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.agenda_appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing broad policies
DROP POLICY IF EXISTS "Org view appointments" ON public.agenda_appointments;
DROP POLICY IF EXISTS "Org manage appointments" ON public.agenda_appointments;

-- Policy: Admin and Secretary can do EVERYTHING
CREATE POLICY "Admin/Secretary manage all appointments" ON public.agenda_appointments
USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
)
WITH CHECK (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
);

-- Policy: Professional can manage ONLY their own appointments
CREATE POLICY "Professional manage own appointments" ON public.agenda_appointments
USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    professional_id IN (
        SELECT id FROM public.agenda_professionals 
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    professional_id IN (
        SELECT id FROM public.agenda_professionals 
        WHERE user_id = auth.uid()
    )
);
