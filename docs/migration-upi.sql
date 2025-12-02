-- Add upi_id column to stalls table
-- Run this in Supabase SQL Editor

ALTER TABLE stalls 
ADD COLUMN upi_id TEXT;

-- Update existing stalls with a dummy UPI ID for testing
UPDATE stalls 
SET upi_id = 'merchant@okicici' 
WHERE upi_id IS NULL;
