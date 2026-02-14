-- Tabela para Sessões de Caixa (Abertura/Fechamento)
CREATE TABLE IF NOT EXISTS public.register_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    opening_balance NUMERIC(10,2) DEFAULT 0,
    closing_balance NUMERIC(10,2),
    status TEXT DEFAULT 'open', -- 'open', 'closed'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.register_sessions ENABLE ROW LEVEL SECURITY;

-- Política de Acesso (Dono da loja)
CREATE POLICY "Owners can manage their register sessions" ON public.register_sessions
    USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
    WITH CHECK (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));
