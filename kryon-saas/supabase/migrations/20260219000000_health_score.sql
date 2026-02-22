-- Migration: Health Score Engine & Usage Tracking
-- Description: Adds tables for tracking daily organization usage and calculating health scores.

-- 1. Organization Daily Stats (Usage Tracking)
CREATE TABLE IF NOT EXISTS public.org_daily_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    
    -- Activity Metrics
    login_count INT DEFAULT 0,
    active_users_count INT DEFAULT 0, -- Distinct users logged in
    
    -- Value Metrics
    appointments_created INT DEFAULT 0,
    appointments_completed INT DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0, -- Transaction volume inside the org
    
    -- Reliability Metrics
    errors_encountered INT DEFAULT 0,
    
    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(organization_id, date)
);

-- 2. Health Scores (Calculated Daily Snapshot)
CREATE TABLE IF NOT EXISTS public.health_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    
    score INT CHECK (score >= 0 AND score <= 100),
    status TEXT, -- 'healthy', 'warning', 'critical'
    
    -- Component Scores (0-100)
    activity_score INT DEFAULT 0,
    value_score INT DEFAULT 0,
    reliability_score INT DEFAULT 0,
    
    insights JSONB, -- Array of strings e.g., ["Low login rate", "High error rate"]
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.org_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Super Admin: Full Access
CREATE POLICY "Super Admins can view stats" ON public.org_daily_stats
FOR SELECT USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

CREATE POLICY "Super Admins can view health scores" ON public.health_scores
FOR SELECT USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

-- Org Admins: View Own Stats (Optional, maybe for "My Account" page)
CREATE POLICY "Org Admins can view own stats" ON public.org_daily_stats
FOR SELECT USING (
    (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'owner') = organization_id
);

-- Service Role / Backend Actions: Full Access (Implicit)

-- 5. Helper Function to increment stats (Atomic)
CREATE OR REPLACE FUNCTION public.increment_org_stat(
    org_id UUID, 
    stat_type TEXT, 
    amount INT DEFAULT 1
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.org_daily_stats (organization_id, date)
    VALUES (org_id, CURRENT_DATE)
    ON CONFLICT (organization_id, date) DO NOTHING;

    IF stat_type = 'login' THEN
        UPDATE public.org_daily_stats SET login_count = login_count + amount, updated_at = now() 
        WHERE organization_id = org_id AND date = CURRENT_DATE;
    ELSIF stat_type = 'appointment' THEN
        UPDATE public.org_daily_stats SET appointments_created = appointments_created + amount, updated_at = now() 
        WHERE organization_id = org_id AND date = CURRENT_DATE;
    ELSIF stat_type = 'error' THEN
        UPDATE public.org_daily_stats SET errors_encountered = errors_encountered + amount, updated_at = now() 
        WHERE organization_id = org_id AND date = CURRENT_DATE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
