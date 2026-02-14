-- 1. Add tenant_id to subscriptions if it doesn't exist
-- This prepares for multi-tenancy where a subscription belongs to a tenant (Organization), not just a user.
-- For now, we assume tenant_id = user_id (Single User Tenant), but this structure allows growth.
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES auth.users(id);

-- Backfill tenant_id with user_id for existing rows so everything keeps working
UPDATE public.subscriptions 
SET tenant_id = user_id 
WHERE tenant_id IS NULL;

-- 2. Create helper function to get current user's tenant
CREATE OR REPLACE FUNCTION get_user_tenant()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  select tenant_id
  from subscriptions
  where user_id = auth.uid()
  limit 1;
$$;

-- 3. Update Policy for Agenda Clients
DROP POLICY IF EXISTS "Users manage own clients" ON public.agenda_clients;
DROP POLICY IF EXISTS "Agenda clients - tenant access" ON public.agenda_clients;

CREATE POLICY "Agenda clients - tenant access"
ON public.agenda_clients
FOR ALL
USING (
  tenant_id = get_user_tenant()
  and product_slug = 'agenda-facil'
);

-- 4. Update Policy for Agenda Services
DROP POLICY IF EXISTS "Users manage own services" ON public.agenda_services;
DROP POLICY IF EXISTS "Agenda services - tenant access" ON public.agenda_services;

CREATE POLICY "Agenda services - tenant access"
ON public.agenda_services
FOR ALL
USING (
  tenant_id = get_user_tenant()
  and product_slug = 'agenda-facil'
);

-- 5. Update Policy for Agenda Professionals
DROP POLICY IF EXISTS "Users manage own professionals" ON public.agenda_professionals;
DROP POLICY IF EXISTS "Agenda professionals - tenant access" ON public.agenda_professionals;

CREATE POLICY "Agenda professionals - tenant access"
ON public.agenda_professionals
FOR ALL
USING (
  tenant_id = get_user_tenant()
  and product_slug = 'agenda-facil'
);

-- 6. Update Policy for Agenda Work Schedules
DROP POLICY IF EXISTS "Users manage own schedules" ON public.agenda_work_schedules;
DROP POLICY IF EXISTS "Agenda work schedules - tenant access" ON public.agenda_work_schedules;

CREATE POLICY "Agenda work schedules - tenant access"
ON public.agenda_work_schedules
FOR ALL
USING (
  tenant_id = get_user_tenant()
  and product_slug = 'agenda-facil'
);

-- 7. Update Policy for Agenda Appointments
DROP POLICY IF EXISTS "Users manage own appointments" ON public.agenda_appointments;
DROP POLICY IF EXISTS "Agenda appointments - tenant access" ON public.agenda_appointments;

CREATE POLICY "Agenda appointments - tenant access"
ON public.agenda_appointments
FOR ALL
USING (
  tenant_id = get_user_tenant()
  and product_slug = 'agenda-facil'
);

-- 8. Subscriptions Security & Helpers
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can read own subscriptions" ON public.subscriptions;
CREATE POLICY "User can read own subscriptions"
ON public.subscriptions
FOR SELECT
USING (
  user_id = auth.uid()
);

-- 9. Helper: Check Active Subscription
CREATE OR REPLACE FUNCTION has_active_subscription(product text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  select exists (
    select 1
    from subscriptions
    where user_id = auth.uid()
      and product_slug = product
      and status in ('trial', 'active')
      and (trial_end is null or trial_end >= now())
  );
$$;
