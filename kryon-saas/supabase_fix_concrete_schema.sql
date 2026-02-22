-- FIX: Add missing columns to Clients and Products for Concrete ERP
-- Run this in the Supabase SQL Editor

-- 1. Updates for erp_clients
ALTER TABLE erp_clients ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE erp_clients ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE erp_clients ADD COLUMN IF NOT EXISTS estado TEXT;
ALTER TABLE erp_clients ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 2. Updates for erp_products
ALTER TABLE erp_products ADD COLUMN IF NOT EXISTS categoria TEXT CHECK (categoria IN ('concreto', 'manilha', 'pre-moldado')) DEFAULT 'concreto';
ALTER TABLE erp_products ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Refresh cache notice (PostgREST)
-- Note: Usually automatic, but if error persists, run:
-- NOTIFY pgrst, 'reload schema';
