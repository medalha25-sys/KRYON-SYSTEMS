-- 5. AGENDA WORK SCHEDULES
CREATE TABLE IF NOT EXISTS public.agenda_work_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_slug TEXT DEFAULT 'agenda-facil',
  professional_id UUID REFERENCES public.agenda_professionals(id) ON DELETE CASCADE NOT NULL,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start TIME,
  break_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_professional_weekday UNIQUE (professional_id, weekday)
);

-- RLS
ALTER TABLE public.agenda_work_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own schedules" ON public.agenda_work_schedules 
  USING (tenant_id = auth.uid());
