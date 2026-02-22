-- MODULE: Driver Mobile Link

-- Add user_id to erp_drivers to allow authentication linking
ALTER TABLE erp_drivers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create a policy for drivers to select their own deliveries
CREATE POLICY "Drivers can view their assigned deliveries"
    ON erp_deliveries FOR SELECT
    USING (motorista_id IN (
        SELECT id FROM erp_drivers WHERE user_id = auth.uid()
    ));

-- Create a policy for drivers to update their assigned deliveries
CREATE POLICY "Drivers can update their assigned deliveries"
    ON erp_deliveries FOR UPDATE
    USING (motorista_id IN (
        SELECT id FROM erp_drivers WHERE user_id = auth.uid()
    ));

-- Add columns for proof of delivery if not exists
ALTER TABLE erp_deliveries ADD COLUMN IF NOT EXISTS comprovante_url TEXT;
ALTER TABLE erp_deliveries ADD COLUMN IF NOT EXISTS geolocalizacao_confirmacao JSONB;
ALTER TABLE erp_deliveries ADD COLUMN IF NOT EXISTS data_chegada TIMESTAMP WITH TIME ZONE;
