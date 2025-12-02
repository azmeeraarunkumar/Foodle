-- Add razorpay_account_id column to stalls table for Razorpay Route integration
ALTER TABLE stalls ADD COLUMN IF NOT EXISTS razorpay_account_id TEXT;

-- Add comment for documentation
COMMENT ON COLUMN stalls.razorpay_account_id IS 'Razorpay Linked Account ID for automatic payment routing (e.g., acc_xxxxxxxxxxxxx)';
