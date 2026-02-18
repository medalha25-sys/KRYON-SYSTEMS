-- Add commission settings to professionals
ALTER TABLE public.agenda_professionals 
ADD COLUMN commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
ADD COLUMN commission_value DECIMAL(10,2) DEFAULT 0;

-- Add split values to financial transactions (Historic Record)
ALTER TABLE public.financial_transactions 
ADD COLUMN professional_commission_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN clinic_profit_amount DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN public.financial_transactions.professional_commission_amount IS 'The amount payable to the professional for this transaction.';
COMMENT ON COLUMN public.financial_transactions.clinic_profit_amount IS 'The revenue retained by the clinic (Total - Commission).';
